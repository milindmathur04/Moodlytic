export const LOCATION_CONFIG = {
  ACCURACY_THRESHOLD: 100, // meters
  TIMEOUT: 10000, // milliseconds
  HIGH_ACCURACY: true,
  MAX_AGE: 0
} as const;

export const ERROR_MESSAGES = {
  PERMISSION_DENIED: {
    DEFAULT: 'Location access was denied. Please enable location services in your browser settings.',
    SAFARI: 'To enable location in Safari:\n1. Click the "aA" button in the address bar\n2. Select "Website Settings"\n3. Allow location access\n4. Refresh the page'
  },
  POSITION_UNAVAILABLE: 'Unable to determine your location. Please try again.',
  TIMEOUT: 'Location request timed out. Please check your connection and try again.',
  UNSUPPORTED: 'Location services are not supported in your browser.',
  GENERAL: 'An error occurred while getting your location.'
} as const;