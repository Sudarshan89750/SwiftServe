import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getUserBookings, getProvider, getProviders } from '../services/api';
import { AvailabilityToggle } from '../components/provider/AvailabilityToggle';
import { ServiceLogCard } from '../components/service/ServiceLogCard';
import MapView from '../components/map/MapView';

const ProviderDashboardPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationTracking, setLocationTracking] = useState(false);
  const { user } = useAuth();
  const { emitLocation } = useSocket();
  const navigate = useNavigate();

  // Fetch provider data and bookings
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('Fetching provider data for user:', user);
        
        // Fetch provider profile
        if (user.role === 'provider') {
          try {
            const providerData = await getProvider(user.id);
            console.log('Provider data fetched:', providerData);
            setProvider(providerData);
          } catch (providerErr) {
            console.error('Error fetching provider data:', providerErr);
            // If provider data not found by user ID, try to find by userId field
            try {
              const providers = await getProviders();
              const userProvider = providers.find(p => 
                p.userId && (p.userId === user.id || p.userId._id === user.id)
              );
              
              if (userProvider) {
                console.log('Provider found by userId:', userProvider);
                setProvider(userProvider);
              } else {
                console.error('No provider profile found for this user');
                setError('Provider profile not found. Please contact support.');
              }
            } catch (listErr) {
              console.error('Error fetching providers list:', listErr);
            }
          }
        }
        
        // Fetch bookings
        try {
          const bookingsData = await getUserBookings();
          console.log('Bookings fetched:', bookingsData);
          setBookings(bookingsData);
        } catch (bookingErr) {
          console.error('Error fetching bookings:', bookingErr);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle location tracking
  useEffect(() => {
    if (!locationTracking || !currentLocation) return;
    
    // Send initial location
    emitLocation(currentLocation);
    
    // Set up interval to update location
    const intervalId = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation: [number, number] = [
              position.coords.latitude,
              position.coords.longitude
            ];
            setCurrentLocation(newLocation);
            emitLocation(newLocation);
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [locationTracking, currentLocation, emitLocation]);

  // Toggle location tracking
  const toggleLocationTracking = () => {
    if (!locationTracking) {
      // Start tracking
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: [number, number] = [
              position.coords.latitude,
              position.coords.longitude
            ];
            setCurrentLocation(location);
            setLocationTracking(true);
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Unable to get your location. Please enable location services.');
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
      }
    } else {
      // Stop tracking
      setLocationTracking(false);
    }
  };

  // Handle availability change
  const handleAvailabilityChange = (isAvailable: boolean) => {
    // If becoming available, ensure location tracking is on
    if (isAvailable && !locationTracking) {
      toggleLocationTracking();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Provider Dashboard</h1>
        <p className="text-gray-600">Manage your services and bookings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Provider status and location */}
        <div className="space-y-6">
          {/* Provider status card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Status</h2>
            
            {provider && (
              <div className="space-y-4">
                <AvailabilityToggle 
                  providerId={provider.id} 
                  initialStatus={provider.isAvailable}
                  onStatusChange={handleAvailabilityChange}
                />
                
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">Location Tracking:</span>
                  <button
                    onClick={toggleLocationTracking}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      locationTracking ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        locationTracking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${locationTracking ? 'text-green-600' : 'text-gray-500'}`}>
                    {locationTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Current location map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Your Location</h3>
            </div>
            
            <div className="h-64 relative">
              {currentLocation ? (
                <MapView 
                  center={currentLocation}
                  zoom={14}
                  popupContent={{
                    title: 'Your Location',
                    content: 'You are here'
                  }}
                  markers={[
                    {
                      position: currentLocation,
                      title: 'Your Location',
                      content: 'You are here'
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-500">Location tracking is disabled</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Middle column: Pending and confirmed bookings */}
        <div className="space-y-6">
          {/* Pending bookings */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Requests</h2>
            
            {pendingBookings.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map(booking => (
                  <ServiceLogCard
                    key={booking.id}
                    booking={booking}
                    onAccept={() => {
                      // In a real app, we would implement accept logic
                      navigate(`/tracking/${booking.id}`);
                    }}
                    onReject={() => {
                      // In a real app, we would implement reject logic
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Confirmed bookings */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Services</h2>
            
            {confirmedBookings.length === 0 ? (
              <p className="text-gray-500">No upcoming services</p>
            ) : (
              <div className="space-y-4">
                {confirmedBookings.map(booking => (
                  <ServiceLogCard
                    key={booking.id}
                    booking={booking}
                    onTrack={() => navigate(`/tracking/${booking.id}`)}
                    onComplete={() => {
                      // In a real app, we would implement complete logic
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column: Completed bookings and stats */}
        <div className="space-y-6">
          {/* Stats card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Stats</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">Total Services</p>
                <p className="text-2xl font-bold text-blue-700">{bookings.length}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{completedBookings.length}</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingBookings.length}</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600">Upcoming</p>
                <p className="text-2xl font-bold text-purple-700">{confirmedBookings.length}</p>
              </div>
            </div>
          </div>
          
          {/* Recent completed services */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Completed</h2>
            
            {completedBookings.length === 0 ? (
              <p className="text-gray-500">No completed services yet</p>
            ) : (
              <div className="space-y-4">
                {completedBookings.slice(0, 3).map(booking => (
                  <ServiceLogCard
                    key={booking.id}
                    booking={booking}
                    isCompleted
                  />
                ))}
                
                {completedBookings.length > 3 && (
                  <button
                    onClick={() => navigate('/history')}
                    className="w-full py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All History
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboardPage;