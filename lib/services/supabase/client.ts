import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the Supabase URL and anon key from environment variables or constants
let supabaseUrl = 'https://cemqnzfkadoyumfhldgw.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbXFuemZrYWRveXVtZmhsZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjUyOTEsImV4cCI6MjA1MTI0MTI5MX0.a7B4frz4naZMuF5wHw7F_uTBTM3a_1L1YrbNO8gKn5Q';

// Try to get values from different sources
try {
  // Try process.env first (for web)
  if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
    supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  }
  if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  }
  
  // Try Constants.expoConfig.extra (for native)
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL) {
    supabaseUrl = Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_URL;
  }
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    supabaseAnonKey = Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  }
} catch (error) {
  console.warn('Error accessing environment variables:', error);
}

// Log the values we're using (for debugging)
console.log('Using Supabase URL:', supabaseUrl);

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});