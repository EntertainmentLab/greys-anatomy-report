import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build-time version string for cache-busting
const BUILD_VERSION = new Date().toISOString()

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION)
  },
  base: '/greys-anatomy-report/', // updated base path
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        scrolly: 'scrolly.html'
      }
    }
  }
})
