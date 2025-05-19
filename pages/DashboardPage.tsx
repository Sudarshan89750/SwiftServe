import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ChartBar, Bell, Calendar, ChevronRight, Clock, DollarSign, MapPin, Star, Users } from 'lucide-react';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { 
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

// Mock data for charts
const activityData = [
  { name: 'Mon', bookings: 4, earnings: 340 },
  { name: 'Tue', bookings: 3, earnings: 255 },
  { name: 'Wed', bookings: 5, earnings: 425 },
  { name: 'Thu', bookings: 2, earnings: 170 },
  { name: 'Fri', bookings: 6, earnings: 510 },
  { name: 'Sat', bookings: 8, earnings: 680 },
  { name: 'Sun', bookings: 4, earnings: 340 },
];

const serviceData = [
  { name: 'Plumbing', value: 35 },
  { name: 'Electrical', value: 24 },
  { name: 'Cleaning', value: 18 },
  { name: 'HVAC', value: 12 },
  { name: 'Landscaping', value: 11 },
];

// Mock notifications
const notifications = [
  { id: 1, message: 'New booking request from Emily Johnson', time: '10 min ago', read: false },
  { id: 2, message: 'Your service with Maria Garcia has been completed', time: '1 hour ago', read: false },
  { id: 3, message: 'New review received: 5 stars!', time: '3 hours ago', read: true },
  { id: 4, message: 'Upcoming service tomorrow at 2 PM', time: '5 hours ago', read: true },
];

// Mock upcoming bookings
const upcomingBookings = [
  { id: 'b1', service: 'Plumbing Repair', provider: 'John Smith', date: '2023-06-10', time: '10:00-12:00', status: 'confirmed' },
  { id: 'b2', service: 'House Cleaning', provider: 'Maria Garcia', date: '2023-06-12', time: '14:00-16:00', status: 'confirmed' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const isProvider = user?.role === 'provider';
  
  return (
    <div className="pb-12">
      {/* Header section */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold mb-2">
            {isProvider ? 'Provider Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-indigo-100">
            {isProvider 
              ? 'Manage your services, bookings, and track performance'
              : 'Track your service bookings and manage your account'}
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Dashboard tabs */}
        <div className="glass mb-8 rounded-xl shadow-md p-1">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'overview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-700 hover:bg-white/50'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'services' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-700 hover:bg-white/50'}`}
              onClick={() => setActiveTab('services')}
            >
              {isProvider ? 'My Services' : 'My Bookings'}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'earnings' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-700 hover:bg-white/50'}`}
              onClick={() => setActiveTab('earnings')}
            >
              {isProvider ? 'Earnings' : 'Payment History'}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'profile' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-700 hover:bg-white/50'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </div>
        </div>
        
        {/* Main dashboard content */}
        <div className="space-y-8">
          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title={isProvider ? "Total Earnings" : "Total Spent"}
              value={isProvider ? "$2,540" : "$845"}
              icon={<DollarSign className="h-5 w-5" />}
              trend={12}
              trendLabel="this month"
            />
            <DashboardCard
              title={isProvider ? "Completed Jobs" : "Services Booked"}
              value={isProvider ? "28" : "12"}
              icon={<Calendar className="h-5 w-5" />}
              trend={8}
            />
            <DashboardCard
              title="Average Rating"
              value="4.8"
              icon={<Star className="h-5 w-5" />}
              trend={3}
            />
            <DashboardCard
              title={isProvider ? "Customer Count" : "Providers Used"}
              value={isProvider ? "45" : "8"}
              icon={<Users className="h-5 w-5" />}
              trend={-2}
            />
          </div>
          
          {/* Activity charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GlassCard className="h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
                  <select className="input py-1 px-2 text-sm w-auto">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activityData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          backdropFilter: 'blur(8px)',
                          borderRadius: '8px',
                          borderColor: 'rgba(226, 232, 240, 0.8)'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#6366f1" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
            
            <div>
              <GlassCard className="h-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Breakdown</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={serviceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="name" type="category" stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          backdropFilter: 'blur(8px)',
                          borderRadius: '8px',
                          borderColor: 'rgba(226, 232, 240, 0.8)'
                        }} 
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#colorGradient)" 
                        barSize={30}
                        radius={[0, 4, 4, 0]}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </div>
          
          {/* Upcoming & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Bookings */}
            <GlassCard>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Services</h2>
                <Link 
                  to={isProvider ? "/provider/bookings" : "/bookings"} 
                  className="text-indigo-600 text-sm font-medium flex items-center hover:text-indigo-800"
                >
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="bg-white/50 p-3 rounded-lg border border-gray-100 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.service}</h3>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {booking.date}, {booking.time}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {isProvider ? booking.provider : "123 Main St, Anytown, CA"}
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No upcoming bookings
                  </div>
                )}
              </div>
            </GlassCard>
            
            {/* Notifications */}
            <GlassCard>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                  Mark all as read
                </button>
              </div>
              
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border ${notification.read ? 'bg-white/30 border-gray-100' : 'bg-white/70 border-indigo-100'} flex items-start gap-3`}
                  >
                    <div className={`p-2 rounded-full mt-1 ${notification.read ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <p className={`${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
