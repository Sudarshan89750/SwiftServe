import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { MapView } from '../map/MapView';
import { getNearbyProviders } from '../../services/api';

interface NearbyProvidersProps {
  serviceId?: string;
  onSelectProvider?: (providerId: string) => void;
}

export const NearbyProviders: React.FC<NearbyProvidersProps> = ({
  serviceId,
  onSelectProvider
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { nearbyProviders } = useSocket();
  const navigate = useNavigate();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Fetch nearby providers when location is available
  useEffect(() => {
    const fetchProviders = async () => {
      if (!userLocation) return;
      
      try {
        setLoading(true);
        
        // First check socket for real-time providers
        if (nearbyProviders.length > 0) {
          setProviders(nearbyProviders);
        } else {
          // Fallback to API if no real-time providers
          const lat = userLocation[0];
          const lng = userLocation[1];
          const data = await getNearbyProviders(lat, lng, 10, serviceId);
          setProviders(data);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load nearby providers');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [userLocation, nearbyProviders, serviceId]);

  // Handle provider selection
  const handleSelectProvider = (providerId: string) => {
    setSelectedProvider(providerId);
    
    if (onSelectProvider) {
      onSelectProvider(providerId);
    }
  };

  // Handle booking
  const handleBookNow = () => {
    if (selectedProvider && serviceId) {
      navigate(`/booking/${serviceId}/${selectedProvider}`);
    }
  };

  if (loading && !userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center text-gray-500">
          <p>Location access is required to find nearby providers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Nearby Providers</h3>
      </div>
      
      <div className="h-64 relative">
        <MapView 
          center={userLocation}
          zoom={12}
          markers={[
            {
              position: userLocation,
              title: 'Your Location',
              icon: '📍'
            },
            ...providers.map(provider => ({
              position: provider.coordinates,
              title: provider.name || 'Provider',
              icon: '🚗',
              onClick: () => handleSelectProvider(provider.id || provider.providerId)
            }))
          ]}
        />
      </div>
      
      <div className="p-4">
        {providers.length === 0 ? (
          <p className="text-gray-500 text-center">No providers available nearby</p>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>{providers.length} providers found nearby</p>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {providers.map((provider) => (
                <div 
                  key={provider.id || provider.providerId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedProvider === (provider.id || provider.providerId)
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectProvider(provider.id || provider.providerId)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{provider.name || 'Provider'}</h4>
                      <p className="text-sm text-gray-600">
                        {provider.distance 
                          ? `${provider.distance.toFixed(1)} km away` 
                          : 'Distance unknown'}
                      </p>
                    </div>
                    {provider.rating && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-700">
                          {provider.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedProvider && serviceId && (
              <button
                onClick={handleBookNow}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Book Selected Provider
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};