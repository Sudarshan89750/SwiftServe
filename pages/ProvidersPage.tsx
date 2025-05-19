import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Search, Star } from 'lucide-react';
import { providers } from '../data/providers';
import { services } from '../data/services';
import { Provider } from '../types';

const ProvidersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(providers);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');
  
  // Filter providers based on search term and service
  useEffect(() => {
    let result = providers;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(provider => 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by service
    if (selectedService) {
      result = result.filter(provider => provider.services.includes(selectedService));
    }
    
    setFilteredProviders(result);
    
    // Update URL params
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedService) params.service = selectedService;
    setSearchParams(params);
  }, [searchTerm, selectedService, setSearchParams]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4">Find Service Providers</h1>
          <p className="text-indigo-100 text-lg max-w-3xl">
            Connect with trusted professionals in your area who can help with all your home service needs.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filter section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search providers by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Results section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => {
              const providerServices = services.filter(service => 
                provider.services.includes(service.id)
              );
              
              return (
                <Link 
                  key={provider.id} 
                  to={`/providers/${provider.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
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
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {providerServices.map(service => (
                          <span key={service.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{provider.address}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">${provider.hourlyRate}/hr</span>
                      <span className="text-indigo-600 text-sm font-medium">View Profile</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvidersPage;
