import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitLocation: (coordinates: [number, number]) => void;
  emitServiceRequest: (request: ServiceRequest) => void;
  nearbyProviders: ProviderLocation[];
  connectedProvider: ProviderLocation | null;
  pairWithProvider: (providerId: string) => void;
}

export interface ServiceRequest {
  userId: string;
  serviceId: string;
  location: [number, number];
  timestamp: number;
}

export interface ProviderLocation {
  providerId: string;
  coordinates: [number, number];
  lastUpdated: number;
  isAvailable: boolean;
  distance?: number;
  name?: string;
  rating?: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// For demo purposes, we're using a mock socket URL
// In production, this would be your actual socket server
const SOCKET_URL = 'https://api.servicehub.example';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyProviders, setNearbyProviders] = useState<ProviderLocation[]>([]);
  const [connectedProvider, setConnectedProvider] = useState<ProviderLocation | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      // For demo, we're not actually connecting to a server
      // This creates a socket instance that doesn't attempt real connections
      autoConnect: false,
      transports: ['websocket'],
    });

    // In a real app, we would connect here
    // socketInstance.connect();

    // Setup event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join user-specific room
      socketInstance.emit('join-as', { userId: user.id, role: user.role });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for nearby providers (for customers)
    socketInstance.on('nearby-providers', (providers: ProviderLocation[]) => {
      console.log('Received nearby providers:', providers);
      setNearbyProviders(providers);
    });

    // Listen for provider pairing
    socketInstance.on('paired', ({ partnerSocketId, partnerRole, partnerCoordinates, partnerName, partnerRating }) => {
      console.log('Paired with provider:', partnerSocketId);
      setConnectedProvider({
        providerId: partnerSocketId,
        coordinates: partnerCoordinates,
        lastUpdated: Date.now(),
        isAvailable: true,
        name: partnerName,
        rating: partnerRating
      });
    });

    // Listen for provider location updates
    socketInstance.on('receive-location', ({ id, coordinates }) => {
      if (connectedProvider && id === connectedProvider.providerId) {
        setConnectedProvider(prev => prev ? {
          ...prev,
          coordinates,
          lastUpdated: Date.now()
        } : null);
      }
    });

    // Listen for provider disconnection
    socketInstance.on('user-disconnected', (id) => {
      if (connectedProvider && connectedProvider.providerId === id) {
        setConnectedProvider(null);
      }
    });

    // For demo purposes, we'll simulate connection
    setIsConnected(true);
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  // Emit user location update
  const emitLocation = useCallback((coordinates: [number, number]) => {
    if (socket && user) {
      console.log('Emitting location update:', coordinates);
      socket.emit('send-location', {
        userId: user.id,
        role: user.role,
        coordinates,
        timestamp: Date.now(),
      });
    }
  }, [socket, user]);

  // Emit service request
  const emitServiceRequest = useCallback((request: ServiceRequest) => {
    if (socket && user) {
      console.log('Emitting service request:', request);
      socket.emit('service_request', {
        ...request,
        userId: user.id,
      });
      
      // For demo: simulate receiving nearby providers
      setTimeout(() => {
        const mockProviders = generateMockNearbyProviders(request.location);
        setNearbyProviders(mockProviders);
      }, 1000);
    }
  }, [socket, user]);

  // Pair with provider
  const pairWithProvider = useCallback((providerId: string) => {
    if (socket && user) {
      console.log('Requesting to pair with provider:', providerId);
      socket.emit('request-pair', {
        userId: user.id,
        providerId
      });
      
      // For demo: simulate pairing with the selected provider
      const selectedProvider = nearbyProviders.find(p => p.providerId === providerId);
      if (selectedProvider) {
        setTimeout(() => {
          setConnectedProvider({
            ...selectedProvider,
            lastUpdated: Date.now()
          });
        }, 800);
      }
    }
  }, [socket, user, nearbyProviders]);

  // Helper function to generate mock nearby providers
  const generateMockNearbyProviders = (userLocation: [number, number]): ProviderLocation[] => {
    return Array.from({ length: 5 }, (_, i) => {
      // Generate random coordinates within ~2km
      const lat = userLocation[0] + (Math.random() - 0.5) * 0.02;
      const lng = userLocation[1] + (Math.random() - 0.5) * 0.02;
      
      // Calculate rough distance in km
      const latDiff = (lat - userLocation[0]) * 111; // 1 deg lat ≈ 111 km
      const lngDiff = (lng - userLocation[1]) * 111 * Math.cos(userLocation[0] * Math.PI / 180);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      return {
        providerId: `provider-${i+1}`,
        coordinates: [lat, lng],
        lastUpdated: Date.now(),
        isAvailable: true,
        distance,
        name: `Provider ${i+1}`,
        rating: 3 + Math.random() * 2 // 3-5 stars
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      emitLocation, 
      emitServiceRequest,
      nearbyProviders,
      connectedProvider,
      pairWithProvider
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
