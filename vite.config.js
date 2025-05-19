import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 12000,
    cors: true,
    hmr: {
      clientPort: 443,
      host: 'work-1-bmgshkdznvzeytfi.prod-runtime.all-hands.dev',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:12001',
        changeOrigin: true,
        ws: true,
      },
    },
    allowedHosts: true,
  },
});