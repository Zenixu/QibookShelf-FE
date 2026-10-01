import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi Vite untuk QibookShelf-FE
// - Proxy /api ke backend Spring Boot (http://localhost:8080) agar tidak kena CORS saat dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
