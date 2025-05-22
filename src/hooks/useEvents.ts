import { useState, useEffect } from 'react';
import { getEventsByMood } from '../services/api/ticketmaster';
import type { TicketmasterEvent } from '../services/api/ticketmaster/types';
import type { Mood, UserProfile } from '../types';

export function useEvents(mood: Mood | null, user: UserProfile | null, budget: number) {
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchEvents() {
      if (!mood || !user?.location?.latitude || !user?.location?.longitude) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const ticketmasterEvents = await getEventsByMood(
          mood,
          user.location.latitude,
          user.location.longitude,
          budget
        );
        if (mounted) {
          setEvents(ticketmasterEvents);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to fetch events. Please try again later.');
          console.error('Event fetch error:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, [mood, user?.location?.latitude, user?.location?.longitude, budget]);

  return { events, isLoading, error };
}