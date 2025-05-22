import axios from 'axios';
import type { GeocodingProvider, GeocodingResult } from '../types';

interface BigDataCloudResponse {
  city: string;
  principalSubdivision: string;
  countryName: string;
}

export class BigDataCloudProvider implements GeocodingProvider {
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    const response = await axios.get<BigDataCloudResponse>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    return {
      city: response.data.city,
      state: response.data.principalSubdivision,
      country: response.data.countryName
    };
  }
}