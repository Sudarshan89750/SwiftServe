import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bell, Check, CircleAlert, Clock, LocateFixed, MapPin, MessageSquare, Navigation, Phone, Shield } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../context/SocketContext';
import { getDistance } from 'geolib';
import 'leaflet/dist/leaflet.css';
import MapView from '../map/MapView';

// Create a custom icon
const createIcon = (color: string = 'blue') => {
  return L.divIcon({
    className: `custom-marker-${color}`,
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Create provider icon
const providerIcon = L.icon({
  iconUrl: '/provider-icon.png', // Fallback to default leaflet icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Create user icon
const userIcon = L.icon({
  iconUrl: '/user-icon.png', // Fallback to default leaflet icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface ServiceTrackingProps {
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  serviceName: string;
  bookingTime: string;
  bookingDate: string;
  status: 'scheduled' | 'searching' | 'provider_found' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
}

export const ServiceTracking: React.FC<ServiceTrackingProps> = ({
  providerId,
  providerName,
  providerAvatar,
  serviceName,
  bookingTime,
  bookingDate,
  status: initialStatus
}) => {
  // Get current geolocation
  const { coordinates: userCoordinates, error: geoError } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000
  });
  
  const [providerLocation, setProviderLocation] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [eta, setEta] = useState<string>('Calculating...');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  // Socket connection for real-time updates
  const { 
    isConnected, 
    emitLocation, 
    emitServiceRequest, 
    nearbyProviders,
    connectedProvider,
    pairWithProvider
  } = useSocket();
  
  // Send location updates when coordinates change
  useEffect(() => {
    if (userCoordinates && isConnected) {
      emitLocation(userCoordinates);
      
      // If searching for a provider, emit a service request
      if (status === 'searching') {
        emitServiceRequest({
          userId: 'user-1', // In a real app, this would be the actual user ID
          serviceId: 'service-1', // In a real app, this would be the actual service ID
          location: userCoordinates,
          timestamp: Date.now(),
        });
      }
    }
  }, [userCoordinates, isConnected, emitLocation, status, emitServiceRequest]);
  
  // Handle connected provider updates
  useEffect(() => {
    if (connectedProvider) {
      setProviderLocation(connectedProvider.coordinates);
      setStatus('en_route');
    }
  }, [connectedProvider]);
  
  // Update ETA when provider location changes
  useEffect(() => {
    if (status === 'en_route' && userCoordinates && providerLocation) {
      // Calculate distance
      const distanceInMeters = getDistance(
        { latitude: providerLocation[0], longitude: providerLocation[1] },
        { latitude: userCoordinates[0], longitude: userCoordinates[1] }
      );
      
      // Assume average speed of 30 km/h = 8.33 m/s
      const timeInSeconds = distanceInMeters / 8.33;
      
      if (distanceInMeters < 100) {
        setStatus('arrived');
        setEta('Arrived');
        
        // After 2 minutes, mark as in progress
        setTimeout(() => {
          setStatus('in_progress');
          
          // After 5 more minutes, mark as completed (for demo purposes, we'll use shorter timeouts)
          setTimeout(() => {
            setStatus('completed');
          }, 10000); // 10 seconds in demo
        }, 5000); // 5 seconds in demo
      } else {
        // Update ETA display
        if (timeInSeconds < 60) {
          setEta('Less than 1 minute');
        } else {
          const minutes = Math.ceil(timeInSeconds / 60);
          setEta(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        }
      }
    }
  }, [providerLocation, userCoordinates, status]);
  
  // Select a provider from the list of nearby providers
  const handleSelectProvider = (providerId: string) => {
    pairWithProvider(providerId);
    setStatus('provider_found');
  };
  
  // Status-based UI elements and actions
  const renderStatusUI = () => {
    switch(status) {
      case 'scheduled':
        return (
          <div className="text-gray-700">Your service is scheduled for {bookingDate} at {bookingTime}</div>
        );
      case 'searching':
        return (
          <div className="text-blue-600 animate-pulse flex items-center">
            <div className="mr-2 h-2 w-2 rounded-full bg-blue-600 animate-ping"></div>
            Finding nearby service providers...
          </div>
        );
      case 'provider_found':
        return (
          <div className="text-green-600 flex items-center">
            <Check className="h-4 w-4 mr-1" />
            Provider found! Waiting for confirmation...
          </div>
        );
      case 'en_route':
        return (
          <div className="text-blue-600 flex items-center">
            <Navigation className="h-4 w-4 mr-1" />
            {providerName} is on the way! ETA: {eta}
          </div>
        );
      case 'arrived':
        return (
          <div className="text-orange-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {providerName} has arrived at your location
          </div>
        );
      case 'in_progress':
        return (
          <div className="text-orange-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Service in progress...
          </div>
        );
      case 'completed':
        return (
          <div className="text-green-600 flex items-center">
            <Check className="h-4 w-4 mr-1" />
            Service completed successfully!
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render nearby providers list
  const renderNearbyProviders = () => {
    if (status !== 'searching' || nearbyProviders.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-gray-700 font-medium mb-2">Available Providers Nearby</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {nearbyProviders.map(provider => (
            <div 
              key={provider.providerId}
              className="bg-white/80 border border-gray-100 rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{provider.name}</div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {(provider.distance || 0).toFixed(1)} km away
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Rating: {provider.rating?.toFixed(1)} ⭐
                </div>
              </div>
              <button 
                className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                onClick={() => handleSelectProvider(provider.providerId)}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (geoError) {
    return (
      <GlassCard className="p-4 text-center">
        <Bell className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Location Error</h2>
        <p className="text-gray-600 mb-4">{geoError}</p>
        <p className="text-gray-600">Please enable location services to use the tracking feature.</p>
      </GlassCard>
    );
  }
  
  return (
    <div className="space-y-6">
      <GlassCard className="tracking-status">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Tracking</h2>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-800">{serviceName}</h3>
          <div className="flex gap-3 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {bookingDate}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {bookingTime}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              {providerAvatar ? (
                <img 
                  src={providerAvatar}
                  alt={providerName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-500 font-bold">
                    {providerName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{providerName}</div>
              <div className="text-sm text-gray-500">Service Provider</div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`rounded-full px-3 py-1 text-xs font-medium 
              ${status === 'completed' ? 'bg-green-100 text-green-800' : 
                status === 'searching' ? 'bg-yellow-100 text-yellow-800' :
                status === 'provider_found' ? 'bg-blue-100 text-blue-800' :
                status === 'en_route' ? 'bg-blue-100 text-blue-800' : 
                status === 'arrived' || status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'}`}
            >
              {status === 'scheduled' ? 'Scheduled' :
               status === 'searching' ? 'Searching' :
               status === 'provider_found' ? 'Provider Found' :
               status === 'en_route' ? 'En Route' :
               status === 'arrived' ? 'Arrived' :
               status === 'in_progress' ? 'In Progress' : 'Completed'}
            </div>
            
            {renderStatusUI()}
          </div>
        </div>
        
        <div className="bg-white/50 border border-gray-100 rounded-lg p-3">
          <div className="flex items-start">
            <div className="p-2 bg-indigo-100 rounded-full mr-3">
              <MapPin className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium">Service Location</div>
              <div className="text-sm text-gray-500">
                {userCoordinates 
                  ? `${userCoordinates[0].toFixed(6)}, ${userCoordinates[1].toFixed(6)}`
                  : 'Fetching your location...'}
              </div>
            </div>
          </div>
        </div>
        
        {renderNearbyProviders()}
      </GlassCard>
      
      <div className="h-96 rounded-xl overflow-hidden shadow-md">
        {userCoordinates && (
          <MapView
            center={userCoordinates}
            popupContent={{
              title: "Your Location",
              content: "Service will be provided here"
            }}
            markers={[
              ...(providerLocation ? [{
                position: providerLocation,
                title: providerName || "Service Provider",
                content: status === 'en_route' ? `ETA: ${eta}` : status
              }] : []),
              ...(status === 'searching' ? nearbyProviders.map(provider => ({
                position: provider.coordinates,
                title: provider.name || "Provider",
                content: `${(provider.distance || 0).toFixed(1)} km away • Rating: ${provider.rating?.toFixed(1)}⭐`
              })) : [])
            ]}
            showRouteLine={status === 'en_route' && !!providerLocation}
            routePoints={providerLocation ? [providerLocation, userCoordinates] : []}
            zoom={14}
          />
        )}
      </div>
      
      <div className="flex justify-center">
        <div className="glass px-4 py-1 inline-flex items-center space-x-10 shadow-sm">
          <button className="flex flex-col items-center py-2 px-3 text-indigo-600">
            <Phone className="h-5 w-5 mb-1" />
            <span className="text-xs">Call</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-indigo-600">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Message</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-indigo-600">
            <LocateFixed className="h-5 w-5 mb-1" />
            <span className="text-xs">Center Map</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-indigo-600">
            <CircleAlert className="h-5 w-5 mb-1" />
            <span className="text-xs">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar component for compatibility
const Calendar = Clock;
