import axios from 'axios';
import { TICKETMASTER_CONFIG } from './config';
import type { TicketmasterSearchParams, TicketmasterResponse, TicketmasterEvent } from './types';

const client = axios.create({
  baseURL: TICKETMASTER_CONFIG.BASE_URL,
  timeout: TICKETMASTER_CONFIG.TIMEOUT
});

export async function searchEvents(params: Partial<TicketmasterSearchParams>): Promise<TicketmasterEvent[]> {
  try {
    const response = await client.get<TicketmasterResponse>('/events', {
      params: {
        apikey: TICKETMASTER_CONFIG.API_KEY,
        ...params,
        size: TICKETMASTER_CONFIG.PAGE_SIZE
      }
    });

    if (!response.data._embedded?.events) {
      console.log('No events found in response:', response.data);
      return [];
    }

    return response.data._embedded.events;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Ticketmaster API error:', {
        status: error.response?.status,
        data: error.response?.data,
        params: error.config?.params
      });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        console.error('Invalid request parameters:', error.config?.params);
        return []; // Return empty array instead of throwing
      }
    }
    throw new Error('Failed to fetch events from Ticketmaster');
  }
}