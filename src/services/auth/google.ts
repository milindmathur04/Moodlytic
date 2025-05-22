import { supabase } from '../supabase/client';
import type { AuthResponse } from '@supabase/supabase-js';

export async function signInWithGoogle(accessToken: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_token: accessToken
        }
      }
    });

    if (error) throw error;
    return { data, error };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}