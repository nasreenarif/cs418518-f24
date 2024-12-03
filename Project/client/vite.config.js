import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


/* export default defineConfig({
  plugins: [react()],
}) */

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../server/client/dist', // Output directory for the build
  },
});