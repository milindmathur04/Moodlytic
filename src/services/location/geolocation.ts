import { LOCATION_CONFIG } from './constants';
import { LocationError } from './errors';
import { isSafari, isMobileSafari, SAFARI_INSTRUCTIONS } from './safari';
import type { LocationResult } from './types';

export async function getCurrentLocation(): Promise<LocationResult> {
  if (!navigator.geolocation) {
    throw new LocationError('Location services are not supported in your browser');
  }

  return new Promise((resolve, reject) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: isMobileSafari() ? 30000 : 20000, // Longer timeout for Safari iOS
      maximumAge: 0 // Force fresh location
    };

    const handleSuccess = (position: GeolocationPosition) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let message = 'Failed to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = isSafari() 
            ? SAFARI_INSTRUCTIONS 
            : 'Location access was denied. Please enable location services.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Unable to determine your location. Please check your device settings and try again.';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out. Please check your connection and try again.';
          break;
      }

      reject(new LocationError(message, error.code));
    };

    // Request location with a longer timeout for Safari
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  });
}