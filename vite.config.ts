import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** The security headers Vercel sends (vercel.json), so `vite preview` and the e2e tests run under the same policy. */
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { headers: { key: string; value: string }[] }[];
};
const securityHeaders = Object.fromEntries(
  vercel.headers.flatMap((rule) => rule.headers).map((h) => [h.key, h.value]),
);

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
  preview: { headers: securityHeaders },
});
