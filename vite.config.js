import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/TV-and-Entertainment/data/4-Outputs/heatwave-plot-react/',
  build: {
    outDir: 'dist'
  }
})
