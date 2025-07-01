import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: false,
    allowedHosts: ['lovelingo-game.leanderziehm.com']
  },
  // Properly handle publicPath for assets
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
}) 