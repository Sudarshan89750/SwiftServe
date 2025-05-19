import { useState, useEffect, Suspense } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, Clock, DollarSign, MapPin, Star, User } from 'lucide-react';
import { providers } from '../data/providers';
import { services } from '../data/services';
import { reviews } from '../data/reviews';
import MapView from '../components/map/MapView';

const ProviderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(providers.find(p => p.id === id));
  const [providerServices, setProviderServices] = useState(
    services.filter(s => provider?.services.includes(s.id))
  );
  const [providerReviews, setProviderReviews] = useState(
    reviews.filter(r => r.providerId === id)
  );
  
  useEffect(() => {
    if (!provider) {
      navigate('/providers', { replace: true });
    }
  }, [provider, navigate]);

  if (!provider) {
    return null;
  }
  
  const availabilityDays = Object.keys(provider.availability);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to providers
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Provider profile card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                  <img
                    src={provider.avatar || `https://ui-avatars.com/api/?name=${provider.name}`}
                    alt={provider.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                <div className="flex items-center mt-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-700">{provider.rating} stars</span>
                  <span className="mx-1">•</span>
                  <span className="text-gray-700">{provider.jobsCompleted} jobs</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-gray-600 mb-3">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                  <span>${provider.hourlyRate}/hr</span>
                </div>
                <div className="flex items-start text-gray-600 mb-3">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <span>{provider.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <span>Member since {new Date(provider.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Provider details */}
          <div className="md:col-span-2 space-y-6">
            {/* About section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 mb-4">{provider.description}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {providerServices.map(service => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                      </div>
                      <Link 
                        to={`/booking/${service.id}/${provider.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availabilityDays.map(day => (
                  <div key={day} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-1">{day}</div>
                    {provider.availability[day].map((slot, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{slot.start} - {slot.end}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Area</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapView 
                  center={provider.coordinates}
                  popupContent={{
                    title: provider.name,
                    content: provider.address
                  }}
                  zoom={13}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          
          {providerReviews.length > 0 ? (
            <div className="grid gap-6">
              {providerReviews.map(review => {
                const reviewService = services.find(s => s.id === review.serviceId);
                
                return (
                  <div key={review.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row md:items-start">
                      <div className="flex-shrink-0 mr-4 mb-4 md:mb-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{review.customerName}</h3>
                          <div className="flex items-center mt-1 md:mt-0">
                            <span className="text-sm text-gray-500 mr-2">{review.date}</span>
                            {reviewService && (
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {reviewService.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No reviews yet for this provider.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;
