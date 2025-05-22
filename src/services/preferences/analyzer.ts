import type { Mood } from '../../types';
import type { UserPreference } from '../../types/preferences';
import type { InteractionType } from '../interactions/repository';

interface UserInteraction {
  type: InteractionType;
  category: string;
  item_name: string;
  created_at: string;
  mood: Mood;
  metadata?: Record<string, any>;
}

interface PreferenceAnalysis {
  topPreferences: {
    [category: string]: string[];
  };
  weights: {
    [category: string]: number;
  };
}

const INTERACTION_WEIGHTS = {
  click: 2.0,  // Clicking shows stronger interest
  view: 0.5    // Viewing shows passive interest
};

const TIME_DECAY_FACTOR = 0.1; // Per day

function calculateTimeDecayScore(timestamp: string): number {
  const daysAgo = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-TIME_DECAY_FACTOR * daysAgo);
}

export function analyzeUserPreferences(
  interactions: UserInteraction[],
  preferences: UserPreference[],
  mood: Mood
): PreferenceAnalysis {
  // 1. Group interactions by category
  const categorizedInteractions = interactions.reduce((acc, interaction) => {
    if (interaction.mood === mood) {
      if (!acc[interaction.category]) {
        acc[interaction.category] = [];
      }
      acc[interaction.category].push(interaction);
    }
    return acc;
  }, {} as Record<string, UserInteraction[]>);

  // 2. Calculate scores for each item within categories
  const scores = Object.entries(categorizedInteractions).reduce((acc, [category, items]) => {
    acc[category] = items.reduce((itemScores, item) => {
      const timeDecayScore = calculateTimeDecayScore(item.created_at);
      const interactionWeight = INTERACTION_WEIGHTS[item.type];
      const score = timeDecayScore * interactionWeight;

      if (!itemScores[item.item_name]) {
        itemScores[item.item_name] = 0;
      }
      itemScores[item.item_name] += score;
      return itemScores;
    }, {} as Record<string, number>);
    return acc;
  }, {} as Record<string, Record<string, number>>);

  // 3. Get top preferences for each category
  const topPreferences = Object.entries(scores).reduce((acc, [category, itemScores]) => {
    acc[category] = Object.entries(itemScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([item]) => item);
    return acc;
  }, {} as Record<string, string[]>);

  // 4. Calculate category weights
  const totalInteractions = Object.values(categorizedInteractions)
    .reduce((sum, items) => sum + items.length, 0);
  
  const weights = Object.entries(categorizedInteractions).reduce((acc, [category, items]) => {
    acc[category] = items.length / totalInteractions;
    return acc;
  }, {} as Record<string, number>);

  return {
    topPreferences,
    weights
  };
}