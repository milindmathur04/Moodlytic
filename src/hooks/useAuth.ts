import { useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { supabase } from '../services/supabase/client';
import { upsertProfile } from '../services/auth/profile';
import type { UserProfile } from '../types';
import { Alert } from 'react-native';

export function useAuth() {
  const { user, setUser } = useUserStore();

  const initializeUser = useCallback(async (googleData: Partial<UserProfile>) => {
    try {
      const profile = await upsertProfile(googleData);
      if (profile) {
        setUser(profile);
        return profile;
      }
      throw new Error('Failed to initialize user profile');
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
      // Still clear the local state even if the API call fails
      setUser(null);
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated: !!user,
    initializeUser,
    setUser,
    logout
  };
}