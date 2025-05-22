import { supabase } from '../supabase/client';
import { getProfile } from './profile';
import type { UserProfile } from '../../types';
import { Platform } from 'react-native';

export async function getSession() {
  try {
    console.log('Getting session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }
    console.log('Session retrieved:', session ? 'Valid session' : 'No session');
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function checkExistingSession(): Promise<UserProfile | null> {
  try {
    console.log('Checking existing session...');
    const session = await getSession();
    if (!session?.user) {
      console.log('No active session found');
      return null;
    }

    console.log('Session found, fetching profile for user:', session.user.id);
    // Always fetch the complete profile from the database
    const profile = await getProfile(session.user.id);
    if (!profile) {
      console.log('No profile found for authenticated user');
      return null;
    }

    console.log('Profile retrieved successfully');
    return profile;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}