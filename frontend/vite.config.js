// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
// // vite.config.js


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.ngrok-free.dev'], // Allows any ngrok link
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // Sends data requests to your backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
