import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  coordinates: [number, number] | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
  });

  // Function to get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: [position.coords.latitude, position.coords.longitude],
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState({
          coordinates: null,
          error: error.message,
          loading: false,
        });
      },
      options
    );
  }, [options]);

  // Watch position (continuous updates)
  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    // Get initial position
    getCurrentPosition();

    // Set up watchPosition
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          coordinates: [position.coords.latitude, position.coords.longitude],
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      options
    );

    // Clean up
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options, getCurrentPosition]);

  return { ...state, getCurrentPosition };
};
