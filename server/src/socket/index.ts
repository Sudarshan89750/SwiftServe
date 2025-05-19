import { Server } from 'socket.io';
import { setupSocketHandlers as initSocketHandlers } from './socket.handler';

export const setupSocketHandlers = (io: Server) => {
  return initSocketHandlers(io);
};