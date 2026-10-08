import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // The Express API runs on its own port in development (npm run dev starts both). Keep the
    // browser's Host header so the API's same-origin check passes, as it does on Vercel.
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: false } },
  },
});
