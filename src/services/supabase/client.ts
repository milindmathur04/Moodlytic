import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cemqnzfkadoyumfhldgw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbXFuemZrYWRveXVtZmhsZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjUyOTEsImV4cCI6MjA1MTI0MTI5MX0.a7B4frz4naZMuF5wHw7F_uTBTM3a_1L1YrbNO8gKn5Q';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});