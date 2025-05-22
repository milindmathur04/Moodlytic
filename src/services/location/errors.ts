export class LocationError extends Error {
  constructor(
    message: string,
    public code?: number,
    public isSafari?: boolean
  ) {
    super(message);
    this.name = 'LocationError';
  }
}

export function handleGeolocationError(error: GeolocationPositionError, isSafari: boolean): LocationError {
  const { ERROR_MESSAGES } = require('./constants');
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new LocationError(
        isSafari ? ERROR_MESSAGES.PERMISSION_DENIED.SAFARI : ERROR_MESSAGES.PERMISSION_DENIED.DEFAULT,
        error.code,
        isSafari
      );
    case error.POSITION_UNAVAILABLE:
      return new LocationError(ERROR_MESSAGES.POSITION_UNAVAILABLE, error.code);
    case error.TIMEOUT:
      return new LocationError(ERROR_MESSAGES.TIMEOUT, error.code);
    default:
      return new LocationError(ERROR_MESSAGES.GENERAL, error.code);
  }
}