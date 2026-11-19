import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development, send /api calls to Django so the browser sees one site.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      // Uploaded files when the backend saves to disk (USE_S3=False).
      '/media': 'http://127.0.0.1:8000',
    },
  },
})
