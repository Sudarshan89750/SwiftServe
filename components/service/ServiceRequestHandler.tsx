import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { createBooking } from '../../services/api';

interface ServiceRequestHandlerProps {
  serviceId: string;
  providerId: string;
  onRequestSent?: () => void;
  onRequestAccepted?: (bookingId: string) => void;
  onRequestRejected?: () => void;
}

export const ServiceRequestHandler: React.FC<ServiceRequestHandlerProps> = ({
  serviceId,
  providerId,
  onRequestSent,
  onRequestAccepted,
  onRequestRejected
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sent' | 'accepted' | 'rejected'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { emitServiceRequest } = useSocket();
  const { user } = useAuth();

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

  // Handle service request
  const handleRequestService = async () => {
    if (!userLocation) {
      setError('Location is required to request service.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Emit service request via socket
      emitServiceRequest({
        serviceId,
        providerId,
        location: userLocation
      });

      // Create booking in pending state
      const booking = await createBooking({
        providerId,
        serviceId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        address: 'Current Location', // In a real app, we would reverse geocode the coordinates
        notes: 'Requested via real-time service'
      });

      setRequestStatus('sent');
      
      if (onRequestSent) {
        onRequestSent();
      }

      // In a real app, we would listen for the provider's response
      // For now, we'll simulate a response after 5 seconds
      setTimeout(() => {
        const accepted = Math.random() > 0.3; // 70% chance of acceptance
        
        if (accepted) {
          setRequestStatus('accepted');
          if (onRequestAccepted) {
            onRequestAccepted(booking.id);
          }
        } else {
          setRequestStatus('rejected');
          if (onRequestRejected) {
            onRequestRejected();
          }
        }
      }, 5000);
    } catch (error) {
      console.error('Error requesting service:', error);
      setError('Failed to request service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Service</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {requestStatus === 'idle' && (
        <button
          onClick={handleRequestService}
          disabled={isLoading || !userLocation}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Request Now'
          )}
        </button>
      )}
      
      {requestStatus === 'sent' && (
        <div className="text-center">
          <div className="animate-pulse mb-2">
            <div className="h-10 w-10 mx-auto bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-700">Waiting for provider response...</p>
        </div>
      )}
      
      {requestStatus === 'accepted' && (
        <div className="text-center text-green-600">
          <svg className="h-10 w-10 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="font-medium">Request accepted!</p>
          <p className="text-sm text-gray-600 mt-1">The provider is on their way.</p>
        </div>
      )}
      
      {requestStatus === 'rejected' && (
        <div className="text-center text-red-600">
          <svg className="h-10 w-10 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="font-medium">Request declined</p>
          <p className="text-sm text-gray-600 mt-1">The provider is currently unavailable.</p>
          <button
            onClick={() => setRequestStatus('idle')}
            className="mt-3 py-1 px-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};