import axios from 'axios';
import type { Mood, UserProfile, Recommendation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getRecommendations(
  mood: Mood,
  userProfile: UserProfile
): Promise<Recommendation> {
  try {
    const { data } = await axios.post(`${API_URL}/recommendations`, {
      mood,
      // Only send necessary user data
      userProfile: {
        id: userProfile.id,
        age: userProfile.age,
        gender: userProfile.gender,
        location: userProfile.location,
        language: userProfile.language,
        nationality: userProfile.nationality
      }
    });
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to get recommendations');
  }
}