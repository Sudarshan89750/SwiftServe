import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Squircle, Calendar, ChevronLeft, CircleCheck, Clock, CreditCard, MapPin, Route } from 'lucide-react';
import { services } from '../data/services';
import { providers } from '../data/providers';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculatePriceBreakdown, LocationCoordinates, PriceBreakdown } from '../utils/calculatePrice';

const BookingPage = () => {
  const { serviceId, providerId } = useParams<{ serviceId: string, providerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(services.find(s => s.id === serviceId));
  const [provider, setProvider] = useState(providers.find(p => p.id === providerId));
  
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Get user's current location
  const { coordinates: userCoordinates, error: geoError } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 10000
  });
  
  useEffect(() => {
    if (!service || !provider) {
      navigate('/services', { replace: true });
    }
  }, [service, provider, navigate]);
  
  // Calculate price breakdown when user and provider coordinates are available
  useEffect(() => {
    if (service && provider && userCoordinates && provider.coordinates) {
      try {
        const calculatedPrice = calculatePriceBreakdown(
          service.basePrice,
          userCoordinates as LocationCoordinates,
          provider.coordinates
        );
        setPriceBreakdown(calculatedPrice);
        setLocationError(null);
      } catch (error) {
        console.error('Error calculating price:', error);
        setLocationError('Unable to calculate distance-based pricing. Using base price.');
      }
    }
  }, [service, provider, userCoordinates]);
  
  // Handle geolocation error
  useEffect(() => {
    if (geoError) {
      setLocationError(`Location error: ${geoError}. Using base price.`);
    }
  }, [geoError]);

  if (!service || !provider) {
    return null;
  }
  
  // Create available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });
  
  // Get available time slots based on provider availability
  const getAvailableTimeSlots = () => {
    if (!bookingDate) return [];
    
    const dayOfWeek = new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long' });
    const availabilitySlots = provider.availability[dayOfWeek] || [];
    
    return availabilitySlots.map(slot => ({
      value: `${slot.start}-${slot.end}`,
      label: `${slot.start} - ${slot.end}`
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !bookingTime || !address) {
      alert('Please fill out all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate booking submission
    setTimeout(() => {
      // In a real app, we would send this data to a server
      const booking = {
        id: `booking-${Date.now()}`,
        customerId: user?.id,
        providerId: provider.id,
        serviceId: service.id,
        status: 'pending',
        date: bookingDate,
        time: bookingTime,
        address,
        price: priceBreakdown ? priceBreakdown.total : service.basePrice + 5,
        priceBreakdown: priceBreakdown || {
          basePrice: service.basePrice,
          distanceSurcharge: 0,
          serviceFee: 5,
          total: service.basePrice + 5,
          distanceInKm: 0
        },
        userCoordinates,
        providerCoordinates: provider.coordinates,
        notes,
        createdAt: new Date().toISOString()
      };
      
      console.log('Booking created:', booking);
      
      // Show success state
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // In a real app, we might store this in a database or localStorage
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([...existingBookings, booking]));
      
      // Reset form
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {isSuccess ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CircleCheck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your booking request has been sent to {provider.name}. You'll receive a confirmation email shortly.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Service</h1>
                
                <div className="flex items-center p-4 bg-indigo-50 rounded-lg mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{service.name}</h2>
                    <p className="text-sm text-gray-600">
                      with {provider.name} • ${provider.hourlyRate}/hr
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Select Date
                      </label>
                      <select
                        id="date"
                        className="input"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                      >
                        <option value="">Select a date</option>
                        {availableDates.map(date => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Select Time
                      </label>
                      <select
                        id="time"
                        className="input"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        disabled={!bookingDate}
                        required
                      >
                        <option value="">Select a time</option>
                        {getAvailableTimeSlots().map(slot => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      {bookingDate && getAvailableTimeSlots().length === 0 && (
                        <p className="mt-2 text-sm text-red-600">
                          No available time slots for this date. Please select another date.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Service Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full address"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions (optional)
                      </label>
                      <textarea
                        id="notes"
                        rows={4}
                        className="input"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions or details for the service provider?"
                      />
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {locationError && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                            <Squircle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-yellow-700">{locationError}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Service Base Price</span>
                          <span className="text-gray-900">${service.basePrice.toFixed(2)}</span>
                        </div>
                        
                        {priceBreakdown && (
                          <>
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center">
                                <span className="text-gray-600">Distance</span>
                                <div className="tooltip ml-1 relative group">
                                  <span className="cursor-help text-gray-400 text-xs">(?)</span>
                                  <div className="tooltip-content hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 w-48">
                                    Distance between your location and the provider
                                  </div>
                                </div>
                              </div>
                              <span className="text-gray-900">{priceBreakdown.distanceInKm.toFixed(1)} km</span>
                            </div>
                            
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center">
                                <span className="text-gray-600">Distance Surcharge</span>
                                <div className="tooltip ml-1 relative group">
                                  <span className="cursor-help text-gray-400 text-xs">(?)</span>
                                  <div className="tooltip-content hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 w-48">
                                    $2.50 per kilometer
                                  </div>
                                </div>
                              </div>
                              <span className="text-gray-900">${priceBreakdown.distanceSurcharge.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Service Fee</span>
                          <span className="text-gray-900">
                            ${priceBreakdown ? priceBreakdown.serviceFee.toFixed(2) : "5.00"}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">
                            ${priceBreakdown ? priceBreakdown.total.toFixed(2) : (service.basePrice + 5).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Route className="h-3 w-3 mr-1 inline" />
                          Dynamic pricing based on location distance
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          *Payment will be collected after the service is completed
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full btn btn-primary py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
