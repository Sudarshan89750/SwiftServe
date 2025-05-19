import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, DollarSign, MapPin, Star, User } from 'lucide-react';
import { services } from '../data/services';
import { providers } from '../data/providers';
import { reviews } from '../data/reviews';

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState(services.find(s => s.id === id));
  const [serviceProviders, setServiceProviders] = useState(
    providers.filter(p => p.services.includes(id || ''))
  );
  const [serviceReviews, setServiceReviews] = useState(
    reviews.filter(r => r.serviceId === id)
  );
  
  useEffect(() => {
    if (!service) {
      navigate('/services', { replace: true });
    }
  }, [service, navigate]);

  if (!service) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to services
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 sm:h-80 md:h-96 overflow-hidden">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                    {service.category}
                  </span>
                  <div className="mx-2">•</div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1">{service.rating} ({serviceReviews.length} reviews)</span>
                  </div>
                  <div className="mx-2">•</div>
                  <User className="h-4 w-4 mr-1" />
                  <span>{service.providersCount} providers</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-center text-lg font-semibold text-gray-900">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-1" />
                  Starting at ${service.basePrice}/hr
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Description</h2>
              <p className="text-gray-600 mb-6">
                {service.description}
              </p>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What to Expect</h2>
              <ul className="list-disc list-inside text-gray-600 mb-6">
                <li className="mb-2">Professional and vetted service providers</li>
                <li className="mb-2">Upfront pricing with no hidden fees</li>
                <li className="mb-2">Satisfaction guarantee on all work performed</li>
                <li>Flexible scheduling to meet your needs</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Service Providers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Service Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceProviders.map(provider => (
              <div key={provider.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={provider.avatar || `https://ui-avatars.com/api/?name=${provider.name}`}
                      alt={provider.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1">{provider.rating}</span>
                      <span className="mx-1">•</span>
                      <span>{provider.jobsCompleted} jobs</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>${provider.hourlyRate}/hr</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{provider.address}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Link to={`/providers/${provider.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                    View Profile
                  </Link>
                  <Link 
                    to={`/booking/${service.id}/${provider.id}`} 
                    className="btn btn-primary"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Reviews Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          
          {serviceReviews.length > 0 ? (
            <div className="grid gap-6">
              {serviceReviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{review.customerName}</h3>
                        <span className="text-sm text-gray-500">{review.date}</span>
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
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No reviews yet for this service.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
