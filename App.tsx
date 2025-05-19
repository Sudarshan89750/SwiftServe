import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ProvidersPage = lazy(() => import('./pages/ProvidersPage'));
const ProviderDetailPage = lazy(() => import('./pages/ProviderDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/providers/:id" element={<ProviderDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'provider']}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking/:serviceId/:providerId" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="relative size-full">
        <div className="absolute inset-0 bg-[#f9f9f9] flex size-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="relative flex items-center justify-center w-10 h-10 bg-white border rounded-full">
            <div className="absolute h-10 w-10 rounded-full animate-spin bg-gradient-to-b from-black/50 to-transparent"></div>
            <div className="absolute flex items-center justify-center bg-white rounded-full h-[38px] w-[38px]">
              <svg
                width={14 * (1920 / 1084)}
                height={14}
                viewBox="0 0 1920 1084"
                fill="black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6727_1730)">
                  <path
                    d="M496.36 933.52V714.848C496.36 561.289 291.434 507.242 214.842 640.703L139.842 771.304C118.857 807.887 71.5077 820.157 35.068 798.026C-0.0838509 776.723 -9.85666 729.978 10.5223 694.373L365.525 76.1461C442.117 -57.2398 647.043 -3.26819 647.043 150.367V369.866C647.043 523.35 851.893 577.397 928.56 444.162L1140.46 75.6945C1217.12 -57.6162 1421.97 -3.56926 1421.97 149.99V371.071C1421.97 524.555 1626.67 578.602 1703.42 445.442L1780.23 312.131C1801.29 275.623 1848.64 263.353 1885.01 285.559C1920.16 307.012 1929.86 353.682 1909.4 389.287L1552.73 1008.42C1475.99 1141.58 1271.29 1087.53 1271.29 934.047V713.719C1271.29 560.235 1066.44 506.188 989.773 639.423L777.877 1007.89C701.21 1141.2 496.36 1087.15 496.36 933.595V933.52Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6727_1730">
                    <rect width="1920" height="1084" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <div className="text-[#000000] font-medium">Loading...</div>
        </div>
      </div>
    </div>
  );
};

export function App() {
  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
