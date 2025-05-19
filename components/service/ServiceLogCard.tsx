import React from 'react';
import { CircleAlert, Box, Calendar, Clock, DollarSign, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { format } from 'date-fns';

interface ServiceLogProps {
  id: string;
  serviceName: string;
  date: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
  };
  duration: number; // in minutes
  cost: {
    base: number;
    extras: { label: string; cost: number }[];
    total: number;
  };
  status: 'completed' | 'cancelled' | 'disputed';
  products?: string[];
  notes?: string;
  onRaiseComplaint?: (id: string) => void;
}

export const ServiceLogCard: React.FC<ServiceLogProps> = ({
  id,
  serviceName,
  date,
  provider,
  duration,
  cost,
  status,
  products,
  notes,
  onRaiseComplaint
}) => {
  const formattedDate = format(new Date(date), 'MMM d, yyyy');
  const formattedTime = format(new Date(date), 'h:mm a');
  
  return (
    <GlassCard className="service-log">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-indigo-100 text-indigo-600">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formattedDate}
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formattedTime}
                </div>
                <div className="flex items-center text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  {provider.name}
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(duration / 60)}h {duration % 60}m
                </div>
              </div>
            </div>
          </div>
          
          {products && products.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Products/Materials Used</h4>
              <div className="flex flex-wrap gap-2">
                {products.map((product, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {notes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={`rounded-full px-3 py-1 text-xs font-medium 
            ${status === 'completed' ? 'bg-green-100 text-green-800' : 
              status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 
              'bg-red-100 text-red-800'}`}
          >
            {status === 'completed' ? 'Completed' : 
             status === 'cancelled' ? 'Cancelled' : 'Disputed'}
          </div>
          
          <div className="bg-white/50 rounded-lg p-3 border border-gray-100 w-full md:w-52">
            <div className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base Fee</span>
                <span className="font-medium">${cost.base.toFixed(2)}</span>
              </div>
              {cost.extras.map((extra, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-500">{extra.label}</span>
                  <span className="font-medium">${extra.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-1 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-indigo-700">${cost.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {status !== 'disputed' && (
            <button 
              onClick={() => onRaiseComplaint && onRaiseComplaint(id)}
              className="text-sm text-red-600 font-medium flex items-center hover:text-red-800"
            >
              <CircleAlert className="h-4 w-4 mr-1" />
              Report Issue
            </button>
          )}
          
          {status === 'completed' && (
            <div className="flex gap-2 mt-2">
              <button className="btn flex items-center py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </button>
              <button className="btn flex items-center py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                <ThumbsDown className="h-3 w-3 mr-1" />
                Not Helpful
              </button>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
