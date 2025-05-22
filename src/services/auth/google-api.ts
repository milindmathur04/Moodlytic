import axios from 'axios';
import { supabase } from '../supabase/client';
import type { UserProfile } from '../../types';

export async function fetchGoogleUserInfo(accessToken: string): Promise<Partial<UserProfile>> {
  try {
    const { data: userInfo } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Get existing profile if any
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        return existingProfile;
      }
    }

    // Return basic profile if no existing data
    return {
      id: userInfo.sub,
      name: userInfo.name || userInfo.email.split('@')[0],
      email: userInfo.email,
      picture: userInfo.picture
    };
  } catch (error) {
    console.error('Error fetching Google user data:', error);
    throw new Error('Failed to fetch user information from Google');
  }
}