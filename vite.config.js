import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const LIVE_API = 'http://160.191.14.97:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': LIVE_API,
      '/uploads': LIVE_API,
      '/health': LIVE_API,
    },
  },
});
