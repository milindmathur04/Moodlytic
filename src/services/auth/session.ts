import { supabase } from '../supabase/client';
import { getProfile } from './profile';
import type { UserProfile } from '../../types';

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function checkExistingSession(): Promise<UserProfile | null> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return null;
    }

    // Always fetch the complete profile from the database
    const profile = await getProfile(session.user.id);
    if (!profile) {
      console.log('No profile found for authenticated user');
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}