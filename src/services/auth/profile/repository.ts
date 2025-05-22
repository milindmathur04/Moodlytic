import { supabase } from '../../supabase/client';
import { profileTransformer } from './transformers';
import type { UserProfile } from '../../../types';
import type { DbUserProfile } from './types';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching profile for userId:', userId);
    
    if (!userId) {
      console.error('getProfile called with no userId');
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data ? profileTransformer.fromDbProfile(data as DbUserProfile) : null;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

export async function upsertProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  try {
    console.log('Starting upsertProfile with:', profile);

    if (!profile.id || !profile.email) {
      throw new Error('ID and email are required');
    }

    // Transform profile data to match database schema
    const dbProfile = profileTransformer.toDbProfile(profile);

    // Remove undefined values and ensure all values are properly typed
    const cleanDbProfile = Object.entries(dbProfile).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value === null ? null : value;
      }
      return acc;
    }, {} as Record<string, any>) as Partial<DbUserProfile>;

    // First check if profile exists with required fields
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, age, gender, nationality, language')
      .eq('id', cleanDbProfile.id)
      .maybeSingle();

    // Check if all required fields are present
    const hasRequiredFields = existingProfile && 
                            existingProfile.age && 
                            existingProfile.gender && 
                            existingProfile.nationality && 
                            existingProfile.language;

    // If profile exists with required fields, only update non-required fields
    if (hasRequiredFields) {
      const updateData = { ...cleanDbProfile };
      // Don't update required fields if they already exist
      delete updateData.age;
      delete updateData.gender;
      delete updateData.nationality;
      delete updateData.language;

      const result = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', cleanDbProfile.id)
        .select()
        .single();

      if (result.error) throw result.error;
      return profileTransformer.fromDbProfile(result.data as DbUserProfile);
    }

    // Otherwise do a full upsert
    const result = await supabase
      .from('user_profiles')
      .upsert([cleanDbProfile])
      .select()
      .single();

    if (result.error) {
      console.error('Profile upsert error:', result.error);
      throw result.error;
    }

    if (!result.data) {
      throw new Error('Failed to create or update profile');
    }

    console.log('Profile upserted successfully:', result.data);
    return profileTransformer.fromDbProfile(result.data as DbUserProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}