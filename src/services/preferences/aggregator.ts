import type { Mood } from '../../types';
import type { UserPreference } from '../../types/preferences';
import type { InteractionType } from '../interactions/repository';

interface AggregatedPreference {
  category: string;
  preference: string;
  weight: number;
}

interface PreferenceAggregation {
  [category: string]: string[];
}

export function aggregateUserPreferences(
  preferences: UserPreference[],
  interactions: any[],
  selectedMood: Mood
): PreferenceAggregation {
  // Filter preferences for the selected mood
  const moodPreferences = preferences.filter(pref => pref.mood === selectedMood);
  
  // Convert preferences to weighted format
  const weightedPreferences: AggregatedPreference[] = moodPreferences.map(pref => ({
    category: pref.category,
    preference: pref.preference,
    weight: 1
  }));

  // Add interaction-based preferences with weights
  if (interactions && interactions.length > 0) {
    const interactionWeights: Record<InteractionType, number> = {
      click: 2, // Clicking shows stronger interest
      view: 1
    };

    const relevantInteractions = interactions.filter(interaction => 
      interaction.mood === selectedMood
    );

    relevantInteractions.forEach(interaction => {
      const weight = interactionWeights[interaction.type as InteractionType] || 1;
      
      weightedPreferences.push({
        category: interaction.category,
        preference: interaction.item_name,
        weight
      });
    });
  }

  // Group and deduplicate preferences by category
  const aggregatedPreferences = weightedPreferences.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = new Map<string, number>();
    }
    
    // Add weight to existing preference or set new weight
    const currentWeight = acc[curr.category].get(curr.preference) || 0;
    acc[curr.category].set(curr.preference, currentWeight + curr.weight);
    
    return acc;
  }, {} as Record<string, Map<string, number>>);

  // Convert to final format, taking top preferences by weight
  const result: PreferenceAggregation = {};
  
  for (const [category, prefsMap] of Object.entries(aggregatedPreferences)) {
    // Sort by weight and take top 3
    const sortedPrefs = Array.from(prefsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pref]) => pref);
    
    if (sortedPrefs.length > 0) {
      result[category] = sortedPrefs;
    }
  }

  return result;
}