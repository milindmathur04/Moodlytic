export type Mood = 
  | 'happy' 
  | 'excited'
  | 'peaceful'
  | 'sad' 
  | 'anxious'
  | 'tired' 
  | 'energetic' 
  | 'stressed' 
  | 'relaxed'
  | 'creative'
  | 'bored'
  | 'surprise';

export interface UserProfile {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  age?: number;
  gender?: string;
  language?: string;
  locale?: string;
  nationality?: string;
  email_verified?: boolean;
  timezone?: string;
  last_login?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface Recommendation {
  food: {
    name: string;
    type: string;
    description: string;
  };
  activity: {
    name: string;
    type: string;
    description: string;
  };
  entertainment: {
    name: string;
    platform: string;
    description: string;
  };
}