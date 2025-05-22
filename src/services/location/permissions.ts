import { LocationError } from './errors';

const LOCATION_PERMISSION_KEY = 'location_permission_granted';

export function setLocationPermissionGranted() {
  localStorage.setItem(LOCATION_PERMISSION_KEY, 'true');
}

export function isLocationPermissionGranted(): boolean {
  return localStorage.getItem(LOCATION_PERMISSION_KEY) === 'true';
}

export async function checkLocationPermission(): Promise<PermissionState | null> {
  if (!navigator.permissions) {
    return null;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    if (result.state === 'granted') {
      setLocationPermissionGranted();
    }
    return result.state;
  } catch (error) {
    console.warn('Permissions API error:', error);
    return null;
  }
}