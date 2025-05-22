import { supabase } from '../supabase/client';
import type { UserPreference } from '../../types/preferences';

export async function saveUserPreferences(
  userId: string,
  preferences: Array<{ mood: string; category: string; preference: string }>
): Promise<void> {
  console.log('Starting saveUserPreferences with:', { userId, preferences });

  if (!userId) {
    console.error('Missing userId in saveUserPreferences');
    throw new Error('Unable to save preferences: User ID is missing');
  }

  if (!preferences?.length) {
    console.error('Empty preferences array in saveUserPreferences');
    throw new Error('Please complete all preference questions before continuing');
  }

  try {
    console.log('Preparing to insert preferences into Supabase');
    const preferencesToInsert = preferences.map(pref => {
      console.log('Processing preference:', pref);
      return {
        user_id: userId,
        mood: pref.mood,
        category: pref.category,
        preference: pref.preference
      };
    });

    console.log('Inserting preferences:', preferencesToInsert);
    const { data, error } = await supabase
      .from('user_preferences')
      .insert(preferencesToInsert)
      .select();

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505') {
        throw new Error('You have already set these preferences');
      } else if (error.code === '23503') {
        throw new Error('Unable to save preferences: User profile not found');
      } else {
        throw new Error(`Unable to save preferences: ${error.message}`);
      }
    }

    console.log('Successfully saved preferences:', data);
  } catch (error) {
    console.error('Full error in saveUserPreferences:', {
      error,
      errorType: error instanceof Error ? 'Error' : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while saving your preferences');
  }
}

export async function getUserPreferences(userId: string): Promise<UserPreference[]> {
  console.log('Starting getUserPreferences for userId:', userId);

  if (!userId) {
    console.error('Missing userId in getUserPreferences');
    throw new Error('Unable to fetch preferences: User ID is missing');
  }

  try {
    console.log('Fetching preferences from Supabase');
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error in getUserPreferences:', error);
      throw new Error('Unable to load your preferences');
    }

    console.log('Retrieved preferences:', data);
    if (!data) return [];

    return data.map(pref => ({
      id: pref.id,
      userId: pref.user_id,
      mood: pref.mood,
      category: pref.category,
      preference: pref.preference,
      createdAt: pref.created_at
    }));
  } catch (error) {
    console.error('Full error in getUserPreferences:', {
      error,
      errorType: error instanceof Error ? 'Error' : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while loading your preferences');
  }
}