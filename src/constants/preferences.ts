import type { PreferenceQuestion } from '../types/preferences';

export const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 'happy-entertainment',
    mood: 'happy',
    category: 'entertainment',
    question: "When you're in a great mood, which type of movie would you prefer to watch?",
    options: [
      {
        id: 'comedy',
        text: 'A laugh-out-loud comedy',
        image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'adventure',
        text: 'An exciting adventure film',
        image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'musical',
        text: 'An upbeat musical',
        image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  {
    id: 'celebration-food',
    mood: 'excited',
    category: 'food',
    question: "You're celebrating a special occasion! What would be your ideal meal?",
    options: [
      {
        id: 'fine-dining',
        text: 'Fine dining experience',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'sushi',
        text: 'Premium sushi feast',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'bbq',
        text: 'Gourmet BBQ experience',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=300'
      }
    ]
  },
  {
    id: 'energetic-activity',
    mood: 'energetic',
    category: 'activity',
    question: "When you're feeling enthusiastic, what activity would you most enjoy?",
    options: [
      {
        id: 'dance',
        text: 'Dancing at a live music event',
        image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'sports',
        text: 'Playing team sports',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'adventure',
        text: 'Outdoor adventure activity',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=300'
      }
    ]
  }
];