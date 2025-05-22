export interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
      dateTime: string;
    };
  };
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      state: {
        name: string;
      };
      address: {
        line1: string;
      };
    }>;
  };
  images: Array<{
    url: string;
    ratio: string;
    width: number;
    height: number;
  }>;
}

export interface TicketmasterSearchParams {
  apikey: string;
  latlong?: string;
  radius?: number;
  unit?: 'miles' | 'km';
  segmentId?: string;
  size?: number;
  sort?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}