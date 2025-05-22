import type { UserProfile } from '../../../types';
import type { RecommendationResponse } from '../../../types/api';
import { getRecommendations } from '../recommendations';

export async function getGroupRecommendations(
  mood: string,
  user: UserProfile,
  budget: number,
  customPrompts?: {
    food?: string;
    activity?: string;
    entertainment?: string;
  },
  previousRecommendations?: RecommendationResponse
): Promise<RecommendationResponse> {
  try {
    return await getRecommendations(
      mood as any, // Cast to Mood type
      user,
      budget,
      customPrompts,
      previousRecommendations
    );
  } catch (error) {
    console.error('Group recommendations error:', error);
    throw error;
  }
}