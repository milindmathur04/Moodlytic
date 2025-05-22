import { useState, useCallback } from 'react';
import type { Mood, UserProfile } from '../types';
import type { RecommendationResponse } from '../types/api';
import { getRecommendations } from '../services/api/recommendations';
import { ApiError } from '../services/api/errors';

export function useRecommendations() {
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendation = useCallback(async (
    mood: Mood,
    user: UserProfile,
    budget: number,
    customPrompts?: {
      food?: string;
      activity?: string;
      entertainment?: string;
    }
  ) => {
    if (!user.location?.address) {
      setError('Please set your location first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getRecommendations(
        mood,
        user,
        budget,
        customPrompts,
        recommendation
      );
      setRecommendation(result);
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'Unable to get recommendations. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove recommendation from dependencies

  return {
    recommendation,
    error,
    isLoading,
    fetchRecommendation
  };
}