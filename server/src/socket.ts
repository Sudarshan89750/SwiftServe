import { Server, Socket } from 'socket.io';

interface UserLocation {
  userId: string;
  role: string;
  coordinates: [number, number];
  timestamp: number;
}

interface ServiceRequest {
  userId: string;
  serviceId: string;
  location: [number, number];
  timestamp: number;
}

interface ProviderLocation {
  providerId: string;
  coordinates: [number, number];
  lastUpdated: number;
  isAvailable: boolean;
  distance?: number;
  name?: string;
  rating?: number;
}

// Store connected users and their socket IDs
const connectedUsers = new Map<string, Socket>();
// Store user locations
const userLocations = new Map<string, UserLocation>();
// Store provider availability
const availableProviders = new Map<string, ProviderLocation>();
// Store active service requests
const activeRequests = new Map<string, ServiceRequest>();
// Store user-provider pairings
const activePairings = new Map<string, string>();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);
    
    // Handle user joining with their role
    socket.on('join-as', ({ userId, role }) => {
      console.log(`User ${userId} joined as ${role}`);
      
      // Store the user's socket
      connectedUsers.set(userId, socket);
      
      // Join a room based on role
      socket.join(role);
      
      // If provider, mark as available
      if (role === 'provider') {
        availableProviders.set(userId, {
          providerId: userId,
          coordinates: [0, 0], // Default coordinates until updated
          lastUpdated: Date.now(),
          isAvailable: true
        });
      }
      
      // Notify the user they've joined successfully
      socket.emit('joined', { userId, role });
    });
    
    // Handle location updates
    socket.on('send-location', (data: UserLocation) => {
      const { userId, role, coordinates, timestamp } = data;
      
      // Store the user's location
      userLocations.set(userId, {
        userId,
        role,
        coordinates,
        timestamp
      });
      
      // If provider, update their location in available providers
      if (role === 'provider') {
        const provider = availableProviders.get(userId);
        if (provider) {
          availableProviders.set(userId, {
            ...provider,
            coordinates,
            lastUpdated: timestamp
          });
        }
      }
      
      // If this user is paired with someone, send location update to partner
      const partnerId = activePairings.get(userId);
      if (partnerId) {
        const partnerSocket = connectedUsers.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit('receive-location', {
            id: userId,
            coordinates
          });
        }
      }
    });
    
    // Handle service requests
    socket.on('service_request', (request: ServiceRequest) => {
      const { userId, serviceId, location } = request;
      
      // Store the request
      activeRequests.set(userId, request);
      
      // Find nearby providers
      const nearbyProviders: ProviderLocation[] = findNearbyProviders(location);
      
      // Send nearby providers to the user
      socket.emit('nearby-providers', nearbyProviders);
      
      // Notify available providers about the request
      nearbyProviders.forEach(provider => {
        const providerSocket = connectedUsers.get(provider.providerId);
        if (providerSocket) {
          providerSocket.emit('new-request', {
            requestId: userId,
            serviceId,
            location,
            distance: provider.distance
          });
        }
      });
    });
    
    // Handle pairing requests
    socket.on('request-pair', ({ userId, providerId }) => {
      const providerSocket = connectedUsers.get(providerId);
      const userSocket = connectedUsers.get(userId);
      
      if (!providerSocket || !userSocket) {
        socket.emit('pair-failed', { message: 'Provider or user not found' });
        return;
      }
      
      // Store the pairing
      activePairings.set(userId, providerId);
      activePairings.set(providerId, userId);
      
      // Get provider details
      const provider = availableProviders.get(providerId);
      
      // Notify both parties about the pairing
      userSocket.emit('paired', {
        partnerSocketId: providerId,
        partnerRole: 'provider',
        partnerCoordinates: provider?.coordinates || [0, 0],
        partnerName: provider?.name || 'Provider',
        partnerRating: provider?.rating || 4.5
      });
      
      providerSocket.emit('paired', {
        partnerSocketId: userId,
        partnerRole: 'customer',
        partnerCoordinates: userLocations.get(userId)?.coordinates || [0, 0],
        partnerName: 'Customer',
        partnerRating: 5
      });
    });
    
    // Handle messages between paired users
    socket.on('send-message', ({ to, message }) => {
      const recipientSocket = connectedUsers.get(to);
      if (recipientSocket) {
        recipientSocket.emit('receive-message', {
          from: socket.id,
          message,
          timestamp: Date.now()
        });
      }
    });
    
    // Handle provider availability updates
    socket.on('update-availability', ({ userId, isAvailable }) => {
      const provider = availableProviders.get(userId);
      if (provider) {
        availableProviders.set(userId, {
          ...provider,
          isAvailable
        });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find the user ID associated with this socket
      let disconnectedUserId: string | undefined;
      
      for (const [userId, userSocket] of connectedUsers.entries()) {
        if (userSocket.id === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      
      if (disconnectedUserId) {
        // Remove from connected users
        connectedUsers.delete(disconnectedUserId);
        
        // Remove from available providers if applicable
        availableProviders.delete(disconnectedUserId);
        
        // Remove from user locations
        userLocations.delete(disconnectedUserId);
        
        // Check if this user was paired with someone
        const partnerId = activePairings.get(disconnectedUserId);
        if (partnerId) {
          // Notify the partner about disconnection
          const partnerSocket = connectedUsers.get(partnerId);
          if (partnerSocket) {
            partnerSocket.emit('user-disconnected', disconnectedUserId);
          }
          
          // Remove the pairing
          activePairings.delete(disconnectedUserId);
          activePairings.delete(partnerId);
        }
        
        // Remove any active requests
        activeRequests.delete(disconnectedUserId);
      }
    });
  });
};

// Helper function to find nearby providers
function findNearbyProviders(location: [number, number]): ProviderLocation[] {
  const nearbyProviders: ProviderLocation[] = [];
  
  for (const [providerId, provider] of availableProviders.entries()) {
    if (provider.isAvailable) {
      // Calculate distance between user and provider
      const distance = calculateDistance(location, provider.coordinates);
      
      // If within reasonable distance (e.g., 10km)
      if (distance <= 10) {
        nearbyProviders.push({
          ...provider,
          distance
        });
      }
    }
  }
  
  // Sort by distance
  return nearbyProviders.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// Helper function to calculate distance between two coordinates (in km)
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}