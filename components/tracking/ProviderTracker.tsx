import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import MapView from '../map/MapView';

interface ProviderTrackerProps {
  bookingId: string;
  customerLocation?: [number, number];
}

export const ProviderTracker: React.FC<ProviderTrackerProps> = ({ 
  bookingId, 
  customerLocation = [0, 0] 
}) => {
  const { connectedProvider } = useSocket();
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [distance, setDistance] = useState<number>(0);
  
  // Calculate distance and ETA when provider location changes
  useEffect(() => {
    if (connectedProvider && customerLocation) {
      // Calculate distance in kilometers
      const providerCoords = connectedProvider.coordinates;
      const distanceInKm = calculateDistance(
        providerCoords[0], 
        providerCoords[1], 
        customerLocation[0], 
        customerLocation[1]
      );
      
      setDistance(distanceInKm);
      
      // Estimate arrival time (assuming average speed of 30 km/h)
      const timeInMinutes = Math.round((distanceInKm / 30) * 60);
      
      if (timeInMinutes < 1) {
        setEstimatedArrival('Less than a minute');
      } else if (timeInMinutes === 1) {
        setEstimatedArrival('1 minute');
      } else if (timeInMinutes < 60) {
        setEstimatedArrival(`${timeInMinutes} minutes`);
      } else {
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = timeInMinutes % 60;
        setEstimatedArrival(
          `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
        );
      }
    }
  }, [connectedProvider, customerLocation]);
  
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  if (!connectedProvider) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="text-center text-gray-500">
          <p>No provider is currently assigned to this booking.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Provider Location</h3>
      </div>
      
      <div className="h-64 relative">
        <MapView 
          center={customerLocation}
          popupContent={{
            title: 'Your Location',
            content: 'You are here'
          }}
          markers={[
            {
              position: customerLocation,
              title: 'Your Location',
              content: 'You are here'
            },
            {
              position: connectedProvider.coordinates,
              title: 'Provider',
              content: 'Provider is here'
            }
          ]}
          showRouteLine={true}
          routePoints={[connectedProvider.coordinates, customerLocation]}
          zoom={12}
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Distance:</span>
          <span className="font-semibold">{distance.toFixed(1)} km</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Estimated arrival:</span>
          <span className="font-semibold">{estimatedArrival}</span>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Last updated: {new Date(connectedProvider.lastUpdated).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};