import { supabase } from '../supabase/client';
import type { AuthResponse } from '@supabase/supabase-js';
import { upsertProfile } from './profile/repository';

export async function initializeGoogleAuth(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/oauth-callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    console.error('OAuth initialization error:', error);
    throw error;
  }
}

export async function handleGoogleCallback(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!data.session?.user) {
      throw new Error('No valid session found');
    }

    try {
      await upsertProfile({
        id: data.session.user.id,
        email: data.session.user.email || '',
        given_name: data.session.user.user_metadata?.full_name?.split(' ')[0],
        family_name: data.session.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
        picture: data.session.user.user_metadata?.avatar_url,
        email_verified: data.session.user.email_verified
      });
    } catch (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Google auth callback error:', error);
    throw error;
  }
}