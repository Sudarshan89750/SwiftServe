import { Link } from 'react-router-dom';
import { Squircle, ChevronLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center">
      <div className="max-w-md w-full px-4 py-16 text-center">
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-indigo-100 mb-6">
          <Squircle className="h-12 w-12 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary py-2 px-6 inline-flex items-center justify-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Go Home
          </Link>
          <Link to="/services" className="btn btn-outline py-2 px-6 inline-flex items-center justify-center">
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
