import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { useUserStore } from '../store/userStore';
import { reverseGeocode } from '../services/location/geocoding';

const DEFAULT_LOCATION = {
  latitude: 41.8781,  // Chicago coordinates
  longitude: -87.6298,
  address: "Chicago, IL"
};

export function useLocation() {
  const { user, updateUserLocation } = useUserStore();
  const [needsLocation, setNeedsLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useDefaultLocation, setUseDefaultLocation] = useState(false);

  // Check location status only once when component mounts
  useEffect(() => {
    const checkLocation = async () => {
      // If we don't have location data, show location prompt
      if (!user?.location) {
        setNeedsLocation(true);
      }
    };

    checkLocation();
  }, [user]);

  const fetchLocation = useCallback(async () => {
    if (isLoading || user?.location) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      const address = await reverseGeocode(latitude, longitude);
      
      updateUserLocation(latitude, longitude, address);
      setNeedsLocation(false);
      setUseDefaultLocation(false);
    } catch (error) {
      console.error('Location error:', error);
      
      let errorMessage = 'Could not get your location. Please try again or enter your city manually.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setNeedsLocation(true);
      
      // If location access fails, use default location
      if (!user?.location) {
        setUseDefaultLocation(true);
        updateUserLocation(
          DEFAULT_LOCATION.latitude,
          DEFAULT_LOCATION.longitude,
          DEFAULT_LOCATION.address
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, updateUserLocation, user]);

  const handleManualLocation = useCallback(async (city: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For manual city input, we'll use the city name as the address
      // and default coordinates (this could be improved with a geocoding service)
      updateUserLocation(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude,
        city
      );
      setNeedsLocation(false);
      setUseDefaultLocation(true);
    } catch (error) {
      setError('Failed to set location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [updateUserLocation]);

  return {
    needsLocation,
    isLoading,
    error,
    useDefaultLocation,
    handleLocationSubmit: fetchLocation,
    handleManualLocation
  };
}