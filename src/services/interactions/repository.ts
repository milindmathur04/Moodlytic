import { supabase } from '../supabase/client';
import type { Mood } from '../../types';

export type InteractionType = 'click' | 'view';
export type InteractionCategory = 'food' | 'activity' | 'entertainment' | 'event';

interface Interaction {
  user_id: string;
  type: InteractionType;
  category: InteractionCategory;
  item_name: string;
  url?: string;
  mood?: Mood;
  metadata?: Record<string, any>;
}

export async function trackInteraction(interaction: Interaction): Promise<void> {
  try {
    console.log('Tracking interaction:', {
      ...interaction,
      metadata: JSON.stringify(interaction.metadata)
    });

    // Validate required fields
    if (!interaction.user_id || !interaction.type || !interaction.category || !interaction.item_name) {
      throw new Error('Missing required fields for interaction tracking');
    }

    const { error, data } = await supabase
      .from('user_interactions')
      .insert({
        user_id: interaction.user_id,
        type: interaction.type,
        category: interaction.category,
        item_name: interaction.item_name,
        url: interaction.url,
        mood: interaction.mood,
        metadata: interaction.metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error tracking interaction:', {
        error,
        interaction
      });
      throw error;
    }

    console.log('Successfully tracked interaction:', data);
  } catch (error) {
    console.error('Failed to track interaction:', {
      error,
      interaction
    });
    throw error;
  }
}

export async function getUserInteractions(userId: string): Promise<Interaction[]> {
  try {
    const { data, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch user interactions:', error);
    return [];
  }
}