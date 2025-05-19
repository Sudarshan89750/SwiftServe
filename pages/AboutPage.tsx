import { Link } from 'react-router-dom';
import { Award, Briefcase, Clock, Shield, ThumbsUp, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              About ServiceHub
            </h1>
            <p className="mt-6 text-xl text-indigo-100">
              Connecting homeowners with trusted service professionals since 2020.
              Our mission is to make home services accessible, reliable, and hassle-free.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Story
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                ServiceHub was founded in 2020 with a simple idea: make it easy for homeowners to find reliable service professionals.
              </p>
              <div className="mt-6 prose prose-indigo prose-lg text-gray-500">
                <p>
                  Our founder, Jane Smith, experienced firsthand the challenge of finding trustworthy home service providers after purchasing her first home. After several disappointing experiences with unreliable contractors, she realized there had to be a better way.
                </p>
                <p className="mt-4">
                  By bringing together the best service professionals and using technology to streamline booking and communication, ServiceHub was born. Today, we're proud to serve thousands of customers across the country, helping them maintain their homes with confidence.
                </p>
                <p className="mt-4">
                  Our platform has grown to include hundreds of verified service providers across multiple categories, from plumbing and electrical work to cleaning and landscaping. But our mission remains the same: connecting homeowners with skilled professionals they can trust.
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="pl-4 -ml-4 lg:pl-0 lg:ml-0 lg:pr-4 -mr-4 lg:pr-0 lg:mr-0">
                <img
                  className="rounded-lg shadow-xl ring-1 ring-gray-400/10"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="ServiceHub team meeting"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              These core principles guide everything we do at ServiceHub
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white shadow rounded-lg px-6 py-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5">
                <ThumbsUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Quality First</h3>
              <p className="mt-2 text-gray-500">
                We never compromise on the quality of professionals in our network. Every provider undergoes rigorous vetting to ensure exceptional service.
              </p>
            </div>
            <div className="bg-white shadow rounded-lg px-6 py-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Trust & Safety</h3>
              <p className="mt-2 text-gray-500">
                We prioritize your safety and security in every interaction. Background checks, insurance verification, and secure payments are our standard.
              </p>
            </div>
            <div className="bg-white shadow rounded-lg px-6 py-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reliability</h3>
              <p className="mt-2 text-gray-500">
                Time is valuable. Our providers show up when promised, complete work efficiently, and communicate proactively about any changes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Leadership Team
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Meet the people dedicated to improving home services
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="h-48 w-48 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/79.jpg"
                  alt="Jane Smith"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Jane Smith</h3>
              <p className="text-indigo-600 mb-2">Founder & CEO</p>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Former home renovation expert with 15+ years in the industry. Passionate about connecting quality professionals with homeowners.
              </p>
            </div>
            <div className="text-center">
              <div className="h-48 w-48 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Michael Johnson"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Michael Johnson</h3>
              <p className="text-indigo-600 mb-2">CTO</p>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Tech veteran with experience at multiple successful startups. Leads our engineering team and product development.
              </p>
            </div>
            <div className="text-center">
              <div className="h-48 w-48 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Sarah Chen"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Sarah Chen</h3>
              <p className="text-indigo-600 mb-2">COO</p>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Operations expert who oversees our provider relationships and ensures quality service across all markets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">ServiceHub By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-extrabold">50K+</div>
                <p className="mt-2 text-indigo-200">Happy Customers</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold">5K+</div>
                <p className="mt-2 text-indigo-200">Service Providers</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold">100K+</div>
                <p className="mt-2 text-indigo-200">Jobs Completed</p>
              </div>
              <div>
                <div className="text-4xl font-extrabold">35+</div>
                <p className="mt-2 text-indigo-200">Cities Served</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join thousands of satisfied customers who trust ServiceHub for their home service needs.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/services" className="btn btn-primary px-8 py-3 text-base mr-4">
                Find Services
              </Link>
              <Link to="/signup" className="btn btn-outline px-8 py-3 text-base">
                Join as Provider
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
