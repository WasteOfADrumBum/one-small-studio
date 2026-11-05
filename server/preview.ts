/**
 * Serves the production build the way Vercel does, for the browser tests and for a local
 * production preview (`npm run preview:prod`):
 *
 * - static files from dist/ first, then the rewrites in vercel.json (SPA fallback to index.html);
 * - every response gets the headers vercel.json assigns to its path;
 * - /api/* goes to the same Express app that api/index.ts hands to Vercel.
 *
 * Email goes to an in-process sink (server/testing/mail-sink.ts), never to Resend, and the mail
 * settings are always overwritten with dummy values, so this server cannot send real email even
 * when real keys are in the environment.
 *
 * Differences from Vercel, by design: no HTTPS, HSTS or HTTP-to-HTTPS redirect, no compression,
 * one long-lived process (the rate limit never resets on a cold start), and the client address is
 * whatever X-Forwarded-For the test sends (Vercel overwrites it). The production smoke check
 * (scripts/smoke) covers those on the real deployment.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { installMailSink, sinkMails } from './testing/mail-sink.js';
import { headersFor, readVercelConfig, rewriteFor } from './vercel-config.js';

process.env.RESEND_API_KEY = 're_sink_not_a_real_key';
process.env.CONTACT_TO = 'inbox@sink.invalid';
delete process.env.CONTACT_FROM;
installMailSink();

const { app: api } = await import('./app.js');
const { resetRateLimit } = await import('./routes/contact.js');

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(`${dist}index.html`)) {
  console.error('dist/ has no build. Run `npm run build` first.');
  process.exit(1);
}

const config = readVercelConfig();
const server = express();
server.disable('x-powered-by');

server.use((req, res, next) => {
  res.set(headersFor(config, req.path));
  next();
});

// Test-only controls. They exist on this server and nowhere else.
server.get('/__test/mail', (req, res) => {
  const tag = String(req.query.tag ?? '');
  if (tag.length < 8) return res.status(400).json({ error: 'tag of 8+ characters required' });
  res.json(sinkMails(tag).map(({ to, from, subject }) => ({ to, from, subject })));
});
server.post('/__test/reset-rate-limit', (_req, res) => {
  resetRateLimit();
  res.status(204).end();
});

server.use((req, res, next) =>
  req.path === '/api' || req.path.startsWith('/api/') ? api(req, res, next) : next(),
);

// Vercel's own cache headers come from vercel.json, so keep express.static from adding its own.
server.use(express.static(dist, { cacheControl: false, index: 'index.html', redirect: false }));

// Read once at start-up: the fallback answers from memory rather than touching the disk per request.
const indexHtml = readFileSync(`${dist}index.html`, 'utf8');

server.use((req, res) => {
  const target =
    req.method === 'GET' || req.method === 'HEAD' ? rewriteFor(config, req.path) : null;
  if (target === '/index.html') return res.type('html').send(indexHtml);
  res.status(404).type('text/plain').send('The page could not be found');
});

const port = Number(process.env.PORT ?? 4173);
server.listen(port, () => console.log(`Production build on http://localhost:${port}`));
