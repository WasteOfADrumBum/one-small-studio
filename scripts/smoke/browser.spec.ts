import { expect, test, type Page } from '@playwright/test';

/** Errors the page itself raised, from its own origin. Third-party noise is reported separately. */
function watchErrors(page: Page, origin: string) {
  const own: string[] = [];
  const thirdParty: string[] = [];
  page.on('pageerror', (e) => own.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const from = msg.location().url;
    (from && !from.startsWith(origin) ? thirdParty : own).push(msg.text());
  });
  return { own, thirdParty };
}

test('the site runs without errors when SoundCloud is unreachable, and offers the link', async ({
  page,
  baseURL,
}) => {
  const errors = watchErrors(page, baseURL!);
  await page.route(
    (url) => /(^|\.)(soundcloud\.com|sndcdn\.com)$/.test(url.hostname),
    (r) => r.abort(),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('One Small Studio');
  await expect(
    page.getByRole('banner').first().getByText('SoundCloud is not responding'),
  ).toBeVisible({ timeout: 25_000 });
  await expect(page.getByRole('link', { name: 'Listen there instead' }).first()).toHaveAttribute(
    'href',
    /^https:\/\/soundcloud\.com\//,
  );
  // Blocked requests log network errors in the console; only script errors count here.
  expect(errors.own.filter((e) => !/Failed to load resource|net::ERR/.test(e))).toEqual([]);
});

test('the live site with live SoundCloud: no script errors, and how long it took', async ({
  page,
  baseURL,
}, info) => {
  const errors = watchErrors(page, baseURL!);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const bar = page.getByRole('banner').first();
  // Either outcome is a working site; which one is SoundCloud's business, so record it.
  await expect(bar.getByText(/Cued|SoundCloud is not responding/)).toBeVisible({ timeout: 25_000 });
  const player = (await bar.getByText('Cued').count()) ? 'ready' : 'SoundCloud not responding';
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const lcp = performance.getEntriesByType('largest-contentful-paint').at(-1)?.startTime;
    return { load: Math.round(nav.loadEventEnd), lcp: lcp ? Math.round(lcp) : null };
  });
  info.annotations.push(
    { type: 'player', description: player },
    { type: 'timing', description: `load ${timing.load} ms, LCP ${timing.lcp ?? 'n/a'} ms` },
  );
  if (errors.thirdParty.length) {
    info.annotations.push({
      type: 'third-party errors',
      description: errors.thirdParty.join(' | '),
    });
  }
  expect(errors.own).toEqual([]);
});
