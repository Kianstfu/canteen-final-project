import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Para sa lokal na development (npm run dev): ipinapasa ang /api at /uploads
// sa Express server na tumatakbo sa http://localhost:3000 (node server.js).
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/uploads': { target: BACKEND, changeOrigin: true }
    }
  }
});
