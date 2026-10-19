import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Three.js is a lazy-loaded renderer; the HTML navigation is available first.
  build: { chunkSizeWarningLimit: 650 },
})
