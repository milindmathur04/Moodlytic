export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface RecommendationItem {
  text: string;
  distance: string | null;
}

export interface RecommendationResponse {
  food: RecommendationItem;
  activity: RecommendationItem;
  entertainment: RecommendationItem;
}

export interface RecommendationPayload {
  name: string;
  age: number | string;
  sex: string;
  nationality: string;
  motherTongue: string;
  location: LocationCoordinates;
  mood: string;
  budget: number;
  preferences?: Record<string, string[]>;
  categoryWeights?: Record<string, number>;
  customPrompts?: {
    food?: string;
    activity?: string;
    entertainment?: string;
  };
  previousRecommendations?: RecommendationResponse;
}