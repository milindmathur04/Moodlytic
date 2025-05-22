import axios from 'axios';
import type { Mood, UserProfile } from '../../types';
import type { RecommendationPayload, RecommendationResponse } from '../../types/api';
import { API_CONFIG } from '../../config/api';
import { ApiError } from './errors';
import { parseRecommendationResponse } from './parser';
import { getUserPreferences } from '../preferences/repository';
import { getUserInteractions } from '../interactions/repository';
import { analyzeUserPreferences } from '../preferences/analyzer';
import { COUNTRIES } from '../../constants/countries';
import { LANGUAGES } from '../../constants/languages';

async function createPayload(
  mood: Mood, 
  user: UserProfile, 
  budget: number,
  customPrompts?: {
    food?: string;
    activity?: string;
    entertainment?: string;
  },
  previousRecommendations?: RecommendationResponse
): Promise<RecommendationPayload> {
  if (!user.location?.latitude || !user.location?.longitude) {
    throw new ApiError('Location coordinates are required for recommendations');
  }

  // Get user preferences and interactions
  const [preferences, interactions] = await Promise.all([
    getUserPreferences(user.id),
    getUserInteractions(user.id)
  ]);
  
  // Analyze preferences and interactions
  const analysis = analyzeUserPreferences(interactions, preferences, mood);
  
  // Create a simplified preference payload
  const preferencePayload = Object.entries(analysis.topPreferences).reduce((acc, [category, items]) => {
    acc[category] = items;
    return acc;
  }, {} as Record<string, string[]>);

  // Get full country name from code
  const nationality = user.nationality 
    ? COUNTRIES.find(country => country.code === user.nationality)?.name || 'not_specified'
    : 'not_specified';

  // Get full language name from code
  const motherTongue = user.language
    ? LANGUAGES.find(lang => lang.code === user.language)?.name || 'English'
    : 'English';

  return {
    name: user.given_name || user.email.split('@')[0],
    age: user.age?.toString() || '25',
    sex: user.gender || 'not_specified',
    nationality,
    motherTongue,
    location: {
      latitude: user.location.latitude,
      longitude: user.location.longitude
    },
    mood,
    budget,
    preferences: preferencePayload,
    categoryWeights: analysis.weights,
    customPrompts,
    previousRecommendations // Include previous recommendations
  };
}

export async function getRecommendations(
  mood: Mood, 
  user: UserProfile,
  budget: number = 50,
  customPrompts?: {
    food?: string;
    activity?: string;
    entertainment?: string;
  },
  previousRecommendations?: RecommendationResponse
): Promise<RecommendationResponse> {
  try {
    console.log('Getting recommendations for:', {
      mood,
      userLocation: user.location,
      budget,
      customPrompts,
      previousRecommendations
    });

    if (!user.location?.latitude || !user.location?.longitude) {
      throw new ApiError('Please enable location access for accurate recommendations');
    }

    const payload = await createPayload(mood, user, budget, customPrompts, previousRecommendations);
    console.log('Sending recommendation request with payload:', payload);
    
    const { data } = await axios.post(
      API_CONFIG.RECOMMENDATIONS_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return parseRecommendationResponse(data);
  } catch (error) {
    console.error('Recommendation error:', error);
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch recommendations',
        error.response?.status
      );
    }
    
    if (error instanceof ApiError) throw error;
    throw new ApiError('An unexpected error occurred');
  }
}