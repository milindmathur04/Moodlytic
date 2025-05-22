import type { Mood } from '../../../types';

export const TICKETMASTER_CONFIG = {
  BASE_URL: 'https://app.ticketmaster.com/discovery/v2',
  API_KEY: import.meta.env.VITE_TICKETMASTER_API_KEY,
  DEFAULT_RADIUS: 50, // Increased radius for more results
  PAGE_SIZE: 20,
  TIMEOUT: 10000,
  SORT: 'date,asc'
} as const;

// Simplified segment mapping to get more results
export const MOOD_TO_SEGMENTS: Record<Mood, string[]> = {
  happy: ['KZFzniwnSyZfZ7v7nJ', 'KZFzniwnSyZfZ7v7nE'], // Music, Sports
  excited: ['KZFzniwnSyZfZ7v7nE', 'KZFzniwnSyZfZ7v7nJ'], // Sports, Music
  peaceful: ['KZFzniwnSyZfZ7v7na'], // Arts & Theatre
  sad: ['KZFzniwnSyZfZ7v7nJ'], // Music
  anxious: ['KZFzniwnSyZfZ7v7na', 'KZFzniwnSyZfZ7v7nJ'], // Arts & Theatre, Music
  tired: ['KZFzniwnSyZfZ7v7na'], // Arts & Theatre
  energetic: ['KZFzniwnSyZfZ7v7nE', 'KZFzniwnSyZfZ7v7nJ'], // Sports, Music
  creative: ['KZFzniwnSyZfZ7v7na'], // Arts & Theatre
  stressed: ['KZFzniwnSyZfZ7v7na', 'KZFzniwnSyZfZ7v7nJ'], // Arts & Theatre, Music
  relaxed: ['KZFzniwnSyZfZ7v7nJ', 'KZFzniwnSyZfZ7v7na'], // Music, Arts & Theatre
  bored: ['KZFzniwnSyZfZ7v7nE', 'KZFzniwnSyZfZ7v7nJ'], // Sports, Music
  surprise: [] // All segments
};