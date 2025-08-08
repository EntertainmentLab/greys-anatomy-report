import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
