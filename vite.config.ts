import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          game: ['compromise', 'an-array-of-english-words'],
          ui: ['react-hot-toast', 'lucide-react'],
          sound: ['use-sound']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});