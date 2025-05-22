import { supabase } from '../supabase/client';
import type { UserProfile } from '../../types';

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

    if (!data) {
      return null;
    }

    // Transform database profile to UserProfile type
    return {
      id: data.id,
      email: data.email,
      given_name: data.given_name || undefined,
      family_name: data.family_name || undefined,
      picture: data.picture || undefined,
      age: data.age || undefined,
      gender: data.gender || undefined,
      nationality: data.nationality || undefined,
      language: data.language || undefined,
      locale: data.locale || undefined,
      email_verified: data.email_verified || false,
      timezone: data.timezone || undefined,
      last_login: data.last_login || undefined
    };
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
    const dbProfile = {
      id: profile.id,
      email: profile.email,
      given_name: profile.given_name || null,
      family_name: profile.family_name || null,
      picture: profile.picture || null,
      age: profile.age || null,
      gender: profile.gender || null,
      nationality: profile.nationality || null,
      language: profile.language || null,
      locale: profile.locale || null,
      email_verified: profile.email_verified || false,
      timezone: profile.timezone || null,
      last_login: profile.last_login || null
    };

    // Remove undefined values and ensure all values are properly typed
    const cleanDbProfile = Object.entries(dbProfile).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value === null ? null : value;
      }
      return acc;
    }, {} as Record<string, any>);

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
      
      // Return the updated profile
      return {
        id: result.data.id,
        email: result.data.email,
        given_name: result.data.given_name || undefined,
        family_name: result.data.family_name || undefined,
        picture: result.data.picture || undefined,
        age: result.data.age || undefined,
        gender: result.data.gender || undefined,
        nationality: result.data.nationality || undefined,
        language: result.data.language || undefined,
        locale: result.data.locale || undefined,
        email_verified: result.data.email_verified || false,
        timezone: result.data.timezone || undefined,
        last_login: result.data.last_login || undefined
      };
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
    
    // Return the updated profile
    return {
      id: result.data.id,
      email: result.data.email,
      given_name: result.data.given_name || undefined,
      family_name: result.data.family_name || undefined,
      picture: result.data.picture || undefined,
      age: result.data.age || undefined,
      gender: result.data.gender || undefined,
      nationality: result.data.nationality || undefined,
      language: result.data.language || undefined,
      locale: result.data.locale || undefined,
      email_verified: result.data.email_verified || false,
      timezone: result.data.timezone || undefined,
      last_login: result.data.last_login || undefined
    };
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}