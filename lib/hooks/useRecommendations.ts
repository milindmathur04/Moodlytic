import { useState, useCallback } from 'react';
import type { Mood, UserProfile } from '../types';
import type { RecommendationResponse } from '../types/api';

// Simplified mock implementation for mobile
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
      // Mock data for testing
      setTimeout(() => {
        const mockRecommendation: RecommendationResponse = {
          food: {
            text: "Try \"Pasta Primavera\" at Bella Italia. A delicious vegetarian pasta with fresh seasonal vegetables and herbs.",
            distance: "2.3 miles away"
          },
          activity: {
            text: "Visit the Central Park for a relaxing afternoon walk. The gardens are beautiful this time of year.",
            distance: "1.5 miles away"
          },
          entertainment: {
            text: "Watch \"The Grand Budapest Hotel\" on Netflix. A visually stunning comedy with great performances.",
            distance: null
          }
        };
        
        setRecommendation(mockRecommendation);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Unable to get recommendations. Please try again.';
      setError(message);
      setIsLoading(false);
    }
  }, []);

  return {
    recommendation,
    error,
    isLoading,
    fetchRecommendation
  };
}