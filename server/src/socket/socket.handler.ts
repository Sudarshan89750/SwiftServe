import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Provider from '../models/Provider.model';
import User from '../models/User.model';

interface LocationUpdate {
  latitude: number;
  longitude: number;
}

interface Message {
  to: string;
  text: string;
}

interface SocketUser {
  id: string;
  role: string;
}

// Store active connections
const activeUsers = new Map<string, string>();
const providerLocations = new Map<string, LocationUpdate>();

export const setupSocketHandlers = (io: Server) => {
  // Middleware for authentication
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret_key_here'
      ) as SocketUser;
      
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    
    const userId = socket.data.user.id;
    
    // Store user connection
    activeUsers.set(userId, socket.id);
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from active users
      if (userId) {
        activeUsers.delete(userId);
        providerLocations.delete(userId);
      }
      
      // Broadcast updated provider list
      io.emit('providers:active', Array.from(providerLocations.entries()));
    });
    
    // Handle provider location updates
    socket.on('provider:location', async (data: LocationUpdate) => {
      try {
        // Store provider location
        providerLocations.set(userId, data);
        
        // Update provider location in database
        if (socket.data.user.role === 'provider') {
          const provider = await Provider.findOne({ userId });
          
          if (provider) {
            provider.coordinates = [data.latitude, data.longitude];
            provider.isAvailable = true;
            await provider.save();
          }
        }
        
        // Broadcast updated provider locations
        io.emit('providers:active', Array.from(providerLocations.entries()));
      } catch (error) {
        console.error('Error updating provider location:', error);
      }
    });
    
    // Handle provider availability toggle
    socket.on('provider:availability', async (isAvailable: boolean) => {
      try {
        if (socket.data.user.role === 'provider') {
          const provider = await Provider.findOne({ userId });
          
          if (provider) {
            provider.isAvailable = isAvailable;
            await provider.save();
            
            // If provider is not available, remove from active providers
            if (!isAvailable) {
              providerLocations.delete(userId);
            }
            
            // Broadcast updated provider list
            io.emit('providers:active', Array.from(providerLocations.entries()));
          }
        }
      } catch (error) {
        console.error('Error updating provider availability:', error);
      }
    });
    
    // Handle service request
    socket.on('service:request', async (data: { providerId: string, serviceId: string, location: LocationUpdate }) => {
      try {
        const { providerId, serviceId, location } = data;
        
        // Get provider user ID
        const provider = await Provider.findById(providerId);
        
        if (!provider) {
          socket.emit('service:request:error', { message: 'Provider not found' });
          return;
        }
        
        // Get customer details
        const customer = await User.findById(userId);
        
        if (!customer) {
          socket.emit('service:request:error', { message: 'Customer not found' });
          return;
        }
        
        // Get provider socket
        const providerSocketId = activeUsers.get(provider.userId.toString());
        
        if (!providerSocketId) {
          socket.emit('service:request:error', { message: 'Provider is offline' });
          return;
        }
        
        // Send request to provider
        io.to(providerSocketId).emit('service:request', {
          customerId: userId,
          customerName: customer.name,
          serviceId,
          location
        });
        
        socket.emit('service:request:sent', { providerId });
      } catch (error) {
        console.error('Error sending service request:', error);
        socket.emit('service:request:error', { message: 'Server error' });
      }
    });
    
    // Handle service request response
    socket.on('service:response', async (data: { customerId: string, accepted: boolean }) => {
      try {
        const { customerId, accepted } = data;
        
        // Get customer socket
        const customerSocketId = activeUsers.get(customerId);
        
        if (!customerSocketId) {
          socket.emit('service:response:error', { message: 'Customer is offline' });
          return;
        }
        
        // Get provider details
        const provider = await Provider.findOne({ userId });
        
        if (!provider) {
          socket.emit('service:response:error', { message: 'Provider not found' });
          return;
        }
        
        // Send response to customer
        io.to(customerSocketId).emit('service:response', {
          providerId: provider._id,
          accepted
        });
      } catch (error) {
        console.error('Error sending service response:', error);
        socket.emit('service:response:error', { message: 'Server error' });
      }
    });
    
    // Handle private messages
    socket.on('message:send', async (data: Message) => {
      try {
        const { to, text } = data;
        
        // Get recipient socket
        const recipientSocketId = activeUsers.get(to);
        
        if (!recipientSocketId) {
          socket.emit('message:error', { message: 'Recipient is offline' });
          return;
        }
        
        // Get sender details
        const sender = await User.findById(userId);
        
        if (!sender) {
          socket.emit('message:error', { message: 'Sender not found' });
          return;
        }
        
        // Send message to recipient
        io.to(recipientSocketId).emit('message:receive', {
          from: userId,
          fromName: sender.name,
          text,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { message: 'Server error' });
      }
    });
  });
};