import { supabase } from '../supabase/client';
import { upsertProfile } from './profile';
import type { AuthError } from '@supabase/supabase-js';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: {
        email_confirmed: false
      }
    }
  });
  
  if (error) throw error;

  // Create initial profile even though email isn't verified
  if (data.user) {
    try {
      await upsertProfile({
        id: data.user.id,
        email: data.user.email || '',
        email_verified: false
      });
    } catch (err) {
      console.error('Error creating initial profile:', err);
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;

  // Ensure profile exists and retrieve it
  if (data.user) {
    try {
      const profile = await upsertProfile({
        id: data.user.id,
        email: data.user.email || '',
        email_verified: data.user.email_verified || false
      });

      // Log the profile data to help debug
      console.log('Retrieved profile:', profile);
      
      return { data, profile };
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
      throw err;
    }
  }

  return { data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update the user's profile with the new avatar URL
  try {
    await upsertProfile({
      id: userId,
      picture: publicUrl
    });
  } catch (err) {
    console.error('Error updating profile with avatar:', err);
    throw err;
  }

  return publicUrl;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) throw error;
}