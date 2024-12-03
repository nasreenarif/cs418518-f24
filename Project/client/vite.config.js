import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


/* export default defineConfig({
  plugins: [react()],
}) */

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cs418-advising-website.onrender.com',
        changeOrigin: true,
        secure: false, // If the backend uses a self-signed certificate
        rewrite: (path) => path.replace(/^\/api/, ''), // Strip `/api` prefix
      },
    },
  },
});