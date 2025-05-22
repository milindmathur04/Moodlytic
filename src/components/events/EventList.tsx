import React from 'react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import type { TicketmasterEvent } from '../../services/api/ticketmaster/types';
import type { Mood } from '../../types';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { trackInteraction } from '../../services/interactions/repository';

interface EventListProps {
  events: TicketmasterEvent[];
  isLoading: boolean;
  error?: string | null;
  userId?: string;
  currentMood?: Mood;
}

export function EventList({ events, isLoading, error, userId, currentMood }: EventListProps) {
  const handleEventClick = async (event: TicketmasterEvent) => {
    if (!userId || !currentMood) {
      console.warn('Missing userId or currentMood for event click:', { userId, currentMood });
      return;
    }

    try {
      console.log('Tracking event click:', {
        userId,
        eventName: event.name,
        mood: currentMood
      });

      await trackInteraction({
        user_id: userId,
        type: 'click',
        category: 'event',
        item_name: event.name,
        url: event.url,
        mood: currentMood,
        metadata: {
          venue: event._embedded?.venues?.[0]?.name,
          city: event._embedded?.venues?.[0]?.city?.name,
          price_range: event.priceRanges?.[0] ? {
            min: event.priceRanges[0].min,
            max: event.priceRanges[0].max,
            currency: event.priceRanges[0].currency
          } : undefined,
          date: event.dates.start.dateTime
        }
      });
      
      window.open(event.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track event click:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-sm sm:text-base text-gray-600">Finding the best events for your mood...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-sm sm:text-base text-red-500">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-sm sm:text-base text-gray-600">No events found matching your mood. Try adjusting your location or selecting a different mood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className="bg-white rounded-xl shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  #{index + 1} Pick
                </span>
                {event.priceRanges && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    From {formatCurrency(event.priceRanges[0].min, event.priceRanges[0].currency)}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.name}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {event.dates.start.dateTime ? formatDate(event.dates.start.dateTime) : 'Date TBA'}
                  </span>
                </div>
                
                {event._embedded?.venues?.[0] && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">
                      {event._embedded.venues[0].name}, {event._embedded.venues[0].city.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {event.images?.[0] && (
              <img 
                src={event.images[0].url} 
                alt={event.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
          </div>
          
          <button
            onClick={() => handleEventClick(event)}
            className="mt-3 inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            <Ticket className="w-4 h-4" />
            Get Tickets
          </button>
        </div>
      ))}
    </div>
  );
}