export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeocodingResult {
  city?: string;
  state?: string;
  country?: string;
  formatted?: string;
}

export interface GeocodingProvider {
  reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult>;
}