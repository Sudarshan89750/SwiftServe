import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, Clock, Search, Shield, Star } from 'lucide-react';
import { services } from '../data/services';
import { providers } from '../data/providers';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState(services.slice(0, 3));
  const [topProviders, setTopProviders] = useState(providers.slice(0, 4));

  // Sort providers by rating for display
  useEffect(() => {
    const sorted = [...providers]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    setTopProviders(sorted);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="md:w-3/5">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Home Services, <br />On Demand
            </h1>
            <p className="text-lg md:text-xl mb-8 text-indigo-100">
              Find trusted professionals for all your home service needs. Book appointments, track service providers, and ensure quality work.
            </p>
            
            <div className="bg-white rounded-lg p-2 shadow-lg flex items-center">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border-0 focus:ring-0 text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 sm:text-sm rounded-md"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Link 
                to={`/services${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="btn btn-primary px-6 py-3"
              >
                Search
              </Link>
            </div>
            
            <div className="mt-6 text-sm text-indigo-100 flex flex-wrap gap-3">
              <span>Popular:</span>
              <Link to="/services?category=Plumbing" className="underline hover:text-white">Plumbing</Link>
              <Link to="/services?category=Electrical" className="underline hover:text-white">Electrical</Link>
              <Link to="/services?category=Cleaning" className="underline hover:text-white">Cleaning</Link>
              <Link to="/services?category=HVAC" className="underline hover:text-white">HVAC</Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-1/3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-indigo-600/90 to-transparent z-10"></div>
          <div className="absolute right-0 h-full w-full bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')] bg-cover bg-center"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ServiceHub</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you with trusted home service professionals to make your life easier.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Professionals</h3>
              <p className="text-gray-600">
                All our service providers undergo thorough background checks and skill verification.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Know exactly when your service provider will arrive with live map tracking.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Satisfaction Guarantee</h3>
              <p className="text-gray-600">
                Not satisfied with the service? We'll make it right or your money back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
            <Link to="/services" className="text-indigo-600 font-medium flex items-center hover:text-indigo-800">
              View all services <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`} className="card group">
                <div className="h-48 mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">${service.basePrice}/hr</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-700">{service.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Service Providers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Top Service Providers</h2>
            <Link to="/providers" className="text-indigo-600 font-medium flex items-center hover:text-indigo-800">
              View all providers <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {topProviders.map((provider) => (
              <Link key={provider.id} to={`/providers/${provider.id}`} className="card group">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100">
                    <img 
                      src={provider.avatar || `https://ui-avatars.com/api/?name=${provider.name}`} 
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-indigo-600 transition-colors">{provider.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {services.find(s => provider.services.includes(s.id))?.category || 'Home Services'}
                  </p>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">{provider.rating}</span>
                  </div>
                  <span className="text-gray-900 font-medium">${provider.hourlyRate}/hr</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ServiceHub for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="btn bg-white text-orange-500 hover:bg-orange-50 py-3 px-8 text-base font-medium">
              Browse Services
            </Link>
            <Link to="/signup" className="btn bg-orange-600 text-white border border-orange-100 hover:bg-orange-700 py-3 px-8 text-base font-medium">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
