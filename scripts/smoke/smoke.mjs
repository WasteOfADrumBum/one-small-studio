#!/usr/bin/env node
/**
 * Read-only smoke check of a deployed One Small Studio. It never sends a message: the only POSTs
 * are a deliberately invalid talkback body (rejected by validation before any email code runs,
 * see server/routes/contact.ts) and a cross-site POST (rejected by the origin check).
 *
 *   npm run smoke                                   # production, https://studio.onesmall.company
 *   EXPECTED_SHA=<40-hex> npm run smoke             # also wait until production serves that commit
 *   SMOKE_URL=http://localhost:4173 SMOKE_LOCAL=1 npm run smoke   # a local `npm run preview:prod`
 *
 * Results are "app" checks (fail the run) or "external" checks (SoundCloud; reported as warnings,
 * because an outage there is not a broken deployment). Exit code 1 means an app check failed.
 */
import { appendFileSync } from 'node:fs';

const PRODUCTION = 'https://studio.onesmall.company';
// Only these hosts may be smoke-tested, so nothing upstream (a workflow input, a deployment
// payload) can point this script at an arbitrary URL.
const TRUSTED_HOSTS = new Set(['studio.onesmall.company']);

const base = new URL(process.env.SMOKE_URL || PRODUCTION);
const local = process.env.SMOKE_LOCAL === '1' && ['localhost', '127.0.0.1'].includes(base.hostname);
if (!local && (base.protocol !== 'https:' || !TRUSTED_HOSTS.has(base.host))) {
  console.error(`Refusing to smoke-test ${base.origin}: not a trusted production address.`);
  process.exit(2);
}
const expectedSha = (process.env.EXPECTED_SHA || '').trim();
if (expectedSha && !/^[0-9a-f]{40}$/.test(expectedSha)) {
  console.error('EXPECTED_SHA must be a full 40-character commit SHA.');
  process.exit(2);
}
const isProduction = base.origin === PRODUCTION;
const waitSeconds = Math.min(900, Math.max(0, Number(process.env.WAIT_SECONDS ?? 600) || 0));

const results = [];
const record = (kind, name, ok, detail = '') => {
  results.push({ kind, name, ok, detail });
  const mark = ok ? 'ok  ' : kind === 'external' ? 'WARN' : 'FAIL';
  console.log(`${mark} [${kind}] ${name}${detail ? ` - ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch with a timeout and two retries on network errors (not on HTTP errors). */
async function get(path, init = {}, origin = base) {
  const url = new URL(path, origin);
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url, {
        redirect: 'manual',
        ...init,
        headers: { 'User-Agent': 'one-small-studio-smoke', ...init.headers },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      last = err;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error(`${url.href}: ${last?.cause?.code ?? last?.message ?? last}`);
}

async function check(kind, name, fn) {
  try {
    const detail = await fn();
    record(kind, name, true, typeof detail === 'string' ? detail : '');
  } catch (err) {
    record(kind, name, false, err instanceof Error ? err.message : String(err));
  }
}

const assert = (cond, message) => {
  if (!cond) throw new Error(message);
};

// 1. Readiness: production serves the expected build.
await check('app', 'production serves the expected commit', async () => {
  const deadline = Date.now() + waitSeconds * 1000;
  let seen;
  for (;;) {
    try {
      const res = await get(`/version.json?t=${Date.now()}`);
      if (res.ok) {
        const { commit } = await res.json();
        seen = String(commit);
        if (!expectedSha) return `serving ${seen}`;
        if (commit === expectedSha) return `serving ${seen}`;
      } else {
        seen = `HTTP ${res.status}`;
      }
    } catch (err) {
      seen = err.message;
    }
    if (Date.now() > deadline) {
      throw new Error(`still serving ${seen} after ${waitSeconds}s, expected ${expectedSha}`);
    }
    await sleep(15_000);
  }
});

// 2. The page and its headers.
let html = '';
await check('app', 'home page responds with the site', async () => {
  const res = await get('/');
  assert(res.status === 200, `HTTP ${res.status}`);
  assert(/text\/html/.test(res.headers.get('content-type') ?? ''), 'not HTML');
  html = await res.text();
  assert(html.includes('<title>One Small Studio</title>'), 'title missing');
  assert(html.includes('<div id="root"></div>'), 'app root missing');
});

await check('app', 'security headers are present', async () => {
  const res = await get('/');
  const h = (k) => res.headers.get(k) ?? '';
  const csp = h('content-security-policy');
  assert(csp.includes("script-src 'self' https://w.soundcloud.com"), `CSP script-src: ${csp}`);
  assert(csp.includes("frame-ancestors 'none'"), 'CSP frame-ancestors missing');
  assert(csp.includes("object-src 'none'"), 'CSP object-src missing');
  assert(!/unsafe-eval/.test(csp), 'CSP allows unsafe-eval');
  if (base.protocol === 'https:') {
    assert(csp.includes('upgrade-insecure-requests'), 'CSP upgrade-insecure-requests missing');
  }
  assert(h('x-content-type-options') === 'nosniff', 'X-Content-Type-Options');
  assert(h('x-frame-options') === 'DENY', 'X-Frame-Options');
  assert(h('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy');
  assert(h('permissions-policy').includes('camera=()'), 'Permissions-Policy');
  if (base.protocol === 'https:') {
    const maxAge = Number(/max-age=(\d+)/.exec(h('strict-transport-security'))?.[1] ?? 0);
    assert(maxAge >= 31536000, `HSTS max-age ${maxAge}`);
  }
});

if (base.protocol === 'https:') {
  await check('app', 'plain HTTP redirects to HTTPS', async () => {
    const res = await get('/', {}, new URL(`http://${base.host}`));
    assert([301, 302, 307, 308].includes(res.status), `HTTP ${res.status}`);
    assert((res.headers.get('location') ?? '').startsWith(`https://${base.host}`), 'location');
  });
}

await check('app', 'canonical and share metadata point at production', async () => {
  for (const tag of [
    `<link rel="canonical" href="${PRODUCTION}/" />`,
    `content="${PRODUCTION}/og-image.png"`,
    `property="og:url" content="${PRODUCTION}/"`,
  ]) {
    assert(html.includes(tag), `missing ${tag}`);
  }
});

// 3. Built assets.
await check('app', 'built assets load with the right type and long caching', async () => {
  const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
  assert(
    refs.some((r) => r.endsWith('.js')),
    'no script asset in the page',
  );
  assert(
    refs.some((r) => r.endsWith('.css')),
    'no stylesheet asset in the page',
  );
  for (const ref of refs) {
    const res = await get(ref);
    assert(res.status === 200, `${ref}: HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (ref.endsWith('.js')) assert(/javascript/.test(type), `${ref}: ${type}`);
    if (ref.endsWith('.css')) assert(/text\/css/.test(type), `${ref}: ${type}`);
    assert(/immutable/.test(res.headers.get('cache-control') ?? ''), `${ref}: not immutable`);
  }
  return `${refs.length} assets`;
});

await check('app', 'robots, sitemap, share image and icon', async () => {
  const robots = await get('/robots.txt');
  assert(robots.status === 200, `robots HTTP ${robots.status}`);
  assert((await robots.text()).includes(`Sitemap: ${PRODUCTION}/sitemap.xml`), 'robots sitemap');
  const sitemap = await get('/sitemap.xml');
  assert(/xml/.test(sitemap.headers.get('content-type') ?? ''), 'sitemap type');
  assert((await sitemap.text()).includes(`<loc>${PRODUCTION}/</loc>`), 'sitemap loc');
  const og = await get('/og-image.png');
  assert(og.status === 200 && og.headers.get('content-type') === 'image/png', 'og-image');
  const icon = await get('/favicon.svg');
  assert(icon.status === 200 && /svg/.test(icon.headers.get('content-type') ?? ''), 'favicon');
});

await check('app', 'an unknown path falls back to the page', async () => {
  const res = await get('/smoke-check-no-such-page');
  assert(res.status === 200, `HTTP ${res.status}`);
  assert((await res.text()).includes('<div id="root"></div>'), 'not the app');
});

// 4. The API, read-only.
await check('app', 'API health, commit and talkback wiring', async () => {
  const res = await get('/api/health');
  assert(res.status === 200, `HTTP ${res.status}`);
  assert(res.headers.get('cache-control') === 'no-store', 'health is cacheable');
  const body = await res.json();
  assert(body.ok === true && body.service === 'one-small-studio', 'health body');
  if (isProduction) assert(body.contact === 'configured', `talkback ${body.contact}`);
  if (expectedSha && body.commit !== null) {
    assert(body.commit === expectedSha, `function runs ${body.commit}`);
  }
  return `commit ${body.commit ?? 'not reported'}, talkback ${body.contact}`;
});

await check('app', 'unknown API path is a JSON 404', async () => {
  const res = await get('/api/smoke-check-no-such-thing');
  assert(res.status === 404, `HTTP ${res.status}`);
  assert((await res.json()).error === 'Not found', 'body');
});

await check('app', 'talkback validation answers without sending anything', async () => {
  // Empty fields fail validation, which runs before the rate limit and before any email code.
  const res = await get('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base.origin },
    body: JSON.stringify({ name: '', email: 'not-an-email', reason: 'hello', message: '' }),
  });
  assert(res.status === 400, `HTTP ${res.status}`);
  assert((await res.json()).error === 'invalid', 'body');
});

await check('app', 'talkback refuses a cross-site POST', async () => {
  const res = await get('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://smoke-check.invalid' },
    body: '{}',
  });
  assert(res.status === 403, `HTTP ${res.status}`);
});

// 5. Third parties the site depends on. Failures here are SoundCloud's, not the deployment's.
await check('external', 'SoundCloud widget script is reachable', async () => {
  const res = await get('/player/api.js', {}, new URL('https://w.soundcloud.com'));
  assert(res.status === 200, `HTTP ${res.status}`);
  assert(/SC\.Widget|Widget/.test(await res.text()), 'unexpected body');
});

// Report.
const failed = results.filter((r) => !r.ok && r.kind === 'app');
const warned = results.filter((r) => !r.ok && r.kind === 'external');
const summary = [
  `### Smoke check: ${base.origin}${expectedSha ? ` at ${expectedSha.slice(0, 7)}` : ''}`,
  '',
  '| | Kind | Check | Detail |',
  '| --- | --- | --- | --- |',
  ...results.map(
    (r) =>
      `| ${r.ok ? 'ok' : r.kind === 'external' ? 'warn' : '**fail**'} | ${r.kind} | ${r.name} | ${r.detail.replace(/\\/g, '\\\\').replace(/\|/g, '\\|')} |`,
  ),
].join('\n');
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
for (const w of warned) console.log(`::warning title=External service::${w.name}: ${w.detail}`);
for (const f of failed) console.log(`::error title=Smoke check failed::${f.name}: ${f.detail}`);
console.log(
  `\n${results.length - failed.length - warned.length} ok, ${failed.length} failed, ${warned.length} external warnings`,
);
process.exit(failed.length ? 1 : 0);
