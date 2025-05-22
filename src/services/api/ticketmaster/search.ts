import { searchEvents } from './client';
import { TICKETMASTER_CONFIG, MOOD_TO_SEGMENTS } from './config';
import type { Mood } from '../../../types';
import type { TicketmasterEvent } from './types';

function filterEventsByBudget(events: TicketmasterEvent[], maxBudget: number): TicketmasterEvent[] {
  return events.filter(event => {
    // If no price ranges, we can't determine if it fits budget
    if (!event.priceRanges?.length) return false;
    
    // Check if the minimum ticket price is within budget
    return event.priceRanges[0].min <= maxBudget;
  });
}

function sortEventsByRelevance(events: TicketmasterEvent[], mood: Mood): TicketmasterEvent[] {
  return events.sort((a, b) => {
    // Prioritize events with price information
    const aHasPrice = !!a.priceRanges?.length;
    const bHasPrice = !!b.priceRanges?.length;
    if (aHasPrice !== bHasPrice) return aHasPrice ? -1 : 1;

    // Prioritize events with venues
    const aHasVenue = !!a._embedded?.venues?.length;
    const bHasVenue = !!b._embedded?.venues?.length;
    if (aHasVenue !== bHasVenue) return aHasVenue ? -1 : 1;

    // Sort by date as final criteria
    return new Date(a.dates.start.dateTime).getTime() - new Date(b.dates.start.dateTime).getTime();
  });
}

export async function getEventsByMood(
  mood: Mood,
  latitude: number,
  longitude: number,
  budget: number
): Promise<TicketmasterEvent[]> {
  try {
    const segments = MOOD_TO_SEGMENTS[mood] || [];
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const startDateTime = now.toISOString().split('.')[0] + 'Z';
    const endDateTime = threeMonthsFromNow.toISOString().split('.')[0] + 'Z';

    const params = {
      latlong: `${latitude},${longitude}`,
      radius: TICKETMASTER_CONFIG.DEFAULT_RADIUS,
      unit: 'miles' as const,
      ...(segments.length > 0 && { segmentId: segments[0] }),
      startDateTime,
      endDateTime,
      sort: TICKETMASTER_CONFIG.SORT
    };

    const events = await searchEvents(params);
    
    // Filter events by budget
    const budgetFilteredEvents = filterEventsByBudget(events, budget);
    
    // Sort the filtered events
    const sortedEvents = sortEventsByRelevance(budgetFilteredEvents, mood);
    
    return sortedEvents.slice(0, 5); // Return only top 5 events
  } catch (error) {
    console.error('Failed to get events by mood:', error);
    throw error;
  }
}