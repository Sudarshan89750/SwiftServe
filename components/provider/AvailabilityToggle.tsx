import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { updateProviderProfile } from '../../services/api';

interface AvailabilityToggleProps {
  providerId: string;
  initialStatus?: boolean;
  onStatusChange?: (isAvailable: boolean) => void;
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  providerId,
  initialStatus = false,
  onStatusChange
}) => {
  const [isAvailable, setIsAvailable] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleProviderAvailability } = useSocket();

  // Update availability status
  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isAvailable;
      
      // Update in database
      await updateProviderProfile(providerId, { isAvailable: newStatus });
      
      // Update in socket
      toggleProviderAvailability(newStatus);
      
      // Update local state
      setIsAvailable(newStatus);
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-gray-700 font-medium">Availability:</span>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isAvailable ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAvailable ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
        {isAvailable ? 'Available' : 'Unavailable'}
      </span>
      
      {isLoading && (
        <div className="ml-2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      )}
    </div>
  );
};