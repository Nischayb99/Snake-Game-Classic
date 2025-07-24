import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Changed from './' to '/'
  build: {
    outDir: 'dist',  // Explicit output directory
    emptyOutDir: true  // Clears dist folder before build
  }
})