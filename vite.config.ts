import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Origen permitido por el CORS del API Gateway
    port: 5173,
    strictPort: true,
  },
})
