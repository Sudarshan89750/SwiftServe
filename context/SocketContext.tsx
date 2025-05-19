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
  toggleProviderAvailability: (isAvailable: boolean) => void;
  sendMessage: (to: string, text: string) => void;
  messages: Message[];
}

export interface ServiceRequest {
  serviceId: string;
  providerId: string;
  location: [number, number];
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

export interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  text: string;
  timestamp: Date;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Socket server URL
const SOCKET_URL = 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyProviders, setNearbyProviders] = useState<ProviderLocation[]>([]);
  const [connectedProvider, setConnectedProvider] = useState<ProviderLocation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) return;

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    // Setup event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for active providers
    socketInstance.on('providers:active', (providers: [string, { latitude: number, longitude: number }][]) => {
      console.log('Received active providers:', providers);
      
      const formattedProviders: ProviderLocation[] = providers.map(([id, location]) => ({
        providerId: id,
        coordinates: [location.latitude, location.longitude],
        lastUpdated: Date.now(),
        isAvailable: true
      }));
      
      setNearbyProviders(formattedProviders);
    });

    // Listen for service requests (for providers)
    socketInstance.on('service:request', (data: { 
      customerId: string, 
      customerName: string, 
      serviceId: string, 
      location: { latitude: number, longitude: number } 
    }) => {
      console.log('Received service request:', data);
      // Handle service request notification
    });

    // Listen for service responses (for customers)
    socketInstance.on('service:response', (data: { 
      providerId: string, 
      accepted: boolean 
    }) => {
      console.log('Received service response:', data);
      
      if (data.accepted) {
        // Find provider in nearby providers
        const provider = nearbyProviders.find(p => p.providerId === data.providerId);
        if (provider) {
          setConnectedProvider(provider);
        }
      }
    });

    // Listen for messages
    socketInstance.on('message:receive', (data: { 
      from: string, 
      fromName: string, 
      text: string, 
      timestamp: string 
    }) => {
      console.log('Received message:', data);
      
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          from: data.from,
          fromName: data.fromName,
          to: user.id,
          text: data.text,
          timestamp: new Date(data.timestamp)
        }
      ]);
    });

    // Listen for errors
    socketInstance.on('message:error', (error) => {
      console.error('Message error:', error);
    });

    socketInstance.on('service:request:error', (error) => {
      console.error('Service request error:', error);
    });

    socketInstance.on('service:response:error', (error) => {
      console.error('Service response error:', error);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Emit user location update
  const emitLocation = useCallback((coordinates: [number, number]) => {
    if (socket && user) {
      console.log('Emitting location update:', coordinates);
      socket.emit('provider:location', {
        latitude: coordinates[0],
        longitude: coordinates[1]
      });
    }
  }, [socket, user]);

  // Toggle provider availability
  const toggleProviderAvailability = useCallback((isAvailable: boolean) => {
    if (socket && user && user.role === 'provider') {
      console.log('Toggling provider availability:', isAvailable);
      socket.emit('provider:availability', isAvailable);
    }
  }, [socket, user]);

  // Emit service request
  const emitServiceRequest = useCallback((request: ServiceRequest) => {
    if (socket && user) {
      console.log('Emitting service request:', request);
      socket.emit('service:request', {
        providerId: request.providerId,
        serviceId: request.serviceId,
        location: {
          latitude: request.location[0],
          longitude: request.location[1]
        }
      });
    }
  }, [socket, user]);

  // Pair with provider
  const pairWithProvider = useCallback((providerId: string) => {
    if (socket && user) {
      console.log('Requesting to pair with provider:', providerId);
      
      // Find provider in nearby providers
      const provider = nearbyProviders.find(p => p.providerId === providerId);
      if (provider) {
        setConnectedProvider(provider);
      }
    }
  }, [socket, user, nearbyProviders]);

  // Send message
  const sendMessage = useCallback((to: string, text: string) => {
    if (socket && user) {
      console.log('Sending message to:', to);
      socket.emit('message:send', { to, text });
      
      // Add message to local state
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          from: user.id,
          fromName: user.name,
          to,
          text,
          timestamp: new Date()
        }
      ]);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      emitLocation, 
      emitServiceRequest,
      nearbyProviders,
      connectedProvider,
      pairWithProvider,
      toggleProviderAvailability,
      sendMessage,
      messages
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
