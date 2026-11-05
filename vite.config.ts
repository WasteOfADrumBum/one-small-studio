import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** The security headers Vercel sends (vercel.json), so `vite preview` and the e2e tests run under the same policy. */
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const securityHeaders = Object.fromEntries(
  vercel.headers
    .filter((rule) => rule.source === '/(.*)')
    .flatMap((rule) => rule.headers)
    .map((h) => [h.key, h.value]),
);

/**
 * Writes dist/version.json with the commit the build came from, so the production smoke check can
 * wait until the live site serves the commit that was just deployed. Vercel sets
 * VERCEL_GIT_COMMIT_SHA during its build; CI sets GITHUB_SHA.
 */
function buildVersion(): Plugin {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null;
  return {
    name: 'oss-build-version',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify({ service: 'one-small-studio', commit: sha })}\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), buildVersion()],
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
