/// <reference types="expo" />

declare module '@env' {
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
}

declare module '*.png' {
  const value: any;
  export = value;
}

// Ensure this file is treated as a module
export {};