export interface PreferenceQuestion {
  id: string;
  mood: string;
  question: string;
  category: 'food' | 'activity' | 'entertainment';
  options: {
    id: string;
    text: string;
    image?: string;
  }[];
}

export interface UserPreference {
  id: string;
  userId: string;
  mood: string;
  category: 'food' | 'activity' | 'entertainment';
  preference: string;
  createdAt: string;
}