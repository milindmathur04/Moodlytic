import type { Mood, UserProfile, Recommendation } from '../../types';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface RecommendationRequest {
  mood: Mood;
  userProfile: Pick<UserProfile, 'id' | 'age' | 'gender' | 'location' | 'language' | 'nationality'>;
}