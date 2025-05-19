import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBooking } from '../services/api';
import { ProviderTracker } from '../components/tracking/ProviderTracker';
import { ChatInterface } from '../components/chat/ChatInterface';

const ServiceTrackingPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([0, 0]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      
      try {
        setLoading(true);
        const data = await getBooking(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error || 'Booking not found'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Tracking</h1>
        <p className="text-gray-600">Booking #{bookingId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Service details and provider tracking */}
        <div className="space-y-6">
          {/* Service details */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{booking.service?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">{booking.provider?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{booking.time}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  booking.status === 'completed' ? 'text-green-600' : 
                  booking.status === 'cancelled' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              
              {booking.notes && (
                <div className="pt-2">
                  <span className="text-gray-600 block mb-1">Notes:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Provider tracker */}
          <ProviderTracker 
            bookingId={bookingId || ''} 
            customerLocation={userLocation} 
          />
        </div>
        
        {/* Right column: Chat with provider */}
        <div className="h-[600px]">
          <ChatInterface 
            recipientId={booking.provider?.userId || ''} 
            recipientName={booking.provider?.name || 'Provider'} 
          />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
        
        {booking.status === 'confirmed' && (
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            // In a real app, we would implement cancellation logic
          >
            Cancel Service
          </button>
        )}
        
        {booking.status === 'completed' && !booking.reviewed && (
          <button 
            onClick={() => navigate(`/review/${bookingId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Leave Review
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceTrackingPage;