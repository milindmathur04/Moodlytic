import { ApiError } from './errors';
import type { RecommendationResponse } from '../../types/api';

function extractDistanceAndCleanText(text: string): { text: string; distance: string | null } {
  // Extract distance if present (e.g., "2 miles away", "3.5 km away")
  const distanceMatch = text.match(/(\d+(?:\.\d+)?\s*(?:miles?|km|kilometers?)\s*away)/i);
  const distance = distanceMatch ? distanceMatch[1] : null;

  // Don't remove the distance from the text anymore
  let cleaned = text
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\s+$/g, '')
    .replace(/([^.])$/, '$1.')  // Ensure sentence ends with period
    .replace(/\.{2,}/g, '.')    // Remove multiple periods
    .replace(/\s{2,}/g, ' ')    // Remove extra spaces
    .replace(/,\s*just\s*\./g, '.') // Remove trailing "just" if it was left behind
    .replace(/\s+just\s*\./g, '.') // Remove trailing "just" if it was left behind
    .trim();

  return { text: cleaned, distance };
}

export function parseRecommendationResponse(responseText: string): RecommendationResponse {
  try {
    // First try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      if (jsonResponse.food && jsonResponse.activity && jsonResponse.entertainment) {
        const food = extractDistanceAndCleanText(jsonResponse.food);
        const activity = extractDistanceAndCleanText(jsonResponse.activity);
        const entertainment = extractDistanceAndCleanText(jsonResponse.entertainment);
        
        return {
          food: {
            text: food.text,
            distance: food.distance
          },
          activity: {
            text: activity.text,
            distance: activity.distance
          },
          entertainment: {
            text: entertainment.text,
            distance: entertainment.distance
          }
        };
      }
    } catch (e) {
      // Continue with text parsing if JSON parsing fails
    }

    // Extract recommendations using regex patterns that handle markdown formatting
    const foodMatch = responseText.match(/Food[^"]*"([^"]+)"/i);
    const activityMatch = responseText.match(/Activity[^"]*"([^"]+)"/i);
    const entertainmentMatch = responseText.match(/Entertainment[^"]*"([^"]+)"/i);

    if (!foodMatch || !activityMatch || !entertainmentMatch) {
      console.error('Failed to parse recommendations from:', responseText);
      throw new ApiError('Unable to parse recommendations from the response. Please try again.');
    }

    const food = extractDistanceAndCleanText(foodMatch[1].trim());
    const activity = extractDistanceAndCleanText(activityMatch[1].trim());
    const entertainment = extractDistanceAndCleanText(entertainmentMatch[1].trim());

    return {
      food: {
        text: food.text,
        distance: food.distance
      },
      activity: {
        text: activity.text,
        distance: activity.distance
      },
      entertainment: {
        text: entertainment.text,
        distance: entertainment.distance
      }
    };
  } catch (error) {
    console.error('Parser error:', error);
    console.error('Response text:', responseText);
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to parse recommendations: ' + (error as Error).message);
  }
}