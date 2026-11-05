import type { Page } from '@playwright/test';
import { expect, playerReady, stubSoundCloud, test } from './fixtures';
import { test as raw } from '@playwright/test';

/**
 * Stable performance assertions: things that are true or false on every run (layout shift with
 * fonts and the widget stubbed, which hosts load, which media waits). Timing-based lab metrics are
 * too noisy for a gate here; the scheduled smoke check records them against production instead.
 * Asset sizes are gated by scripts/check-budgets.mjs.
 */

/** Hosts the page may contact on load, and why. Anything else is a new third party. */
const ALLOWED_HOSTS = new Set([
  'localhost:4173', // the site itself
  'w.soundcloud.com', // widget script and player iframe
  'soundcloud.com', // oEmbed cover lookups
]);

async function layoutShift(page: Page) {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!e.hadRecentInput) total += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 1500);
      }),
  );
}

raw.describe('loading', () => {
  raw(
    'the first screen barely moves while fonts, art and the player arrive',
    async ({ page, browserName }) => {
      raw.skip(browserName !== 'chromium', 'Layout Instability API is Chromium-only');
      await stubSoundCloud(page);
      await page.goto('/');
      await playerReady(page);
      // Web Vitals call CLS under 0.1 good. Measured 0.021 (desktop) and 0.045 (Pixel 7) on
    // 2026-11-05, so the gate is the published threshold rather than a tight, flaky one.
      const cls = await layoutShift(page);
    console.log(`layout shift: ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.1);
    },
  );

  raw('loads nothing from hosts it does not need', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.protocol.startsWith('http')) hosts.add(u.host);
    });
    await stubSoundCloud(page);
    await page.goto('/');
    await playerReady(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    expect([...hosts].filter((h) => !ALLOWED_HOSTS.has(h))).toEqual([]);
  });

  raw('every file the site asks for itself loads, with the right type', async ({ page }) => {
    const bad: string[] = [];
    page.on('response', (res) => {
      const u = new URL(res.url());
      if (u.host !== 'localhost:4173') return;
      if (res.status() >= 400) bad.push(`${res.status()} ${u.pathname}`);
      const type = res.headers()['content-type'] ?? '';
      const ext = u.pathname.split('.').pop();
      const want: Record<string, RegExp> = {
        js: /javascript/,
        css: /text\/css/,
        woff2: /font\/woff2/,
        jpg: /image\/jpeg/,
        png: /image\/png/,
        svg: /image\/svg\+xml/,
      };
      if (ext && want[ext] && !want[ext].test(type)) bad.push(`${type} for ${u.pathname}`);
    });
    page.on('requestfailed', (r) => {
      if (new URL(r.url()).host === 'localhost:4173') bad.push(`failed ${r.url()}`);
    });
    await stubSoundCloud(page);
    await page.goto('/');
    await playerReady(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    expect(bad).toEqual([]);
  });

  raw('cover art below the first screen waits until it is needed', async ({ page }) => {
    await stubSoundCloud(page);
    await page.goto('/');
    await playerReady(page);
    const covers = page.locator('#catalog img');
    expect(await covers.count()).toBeGreaterThan(0);
    for (const img of await covers.all()) await expect(img).toHaveAttribute('loading', 'lazy');
  });

  raw('fonts are served by the site itself', async ({ page }) => {
    const fonts: string[] = [];
    page.on('request', (r) => r.resourceType() === 'font' && fonts.push(new URL(r.url()).host));
    await stubSoundCloud(page);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(fonts.length).toBeGreaterThan(0);
    expect(new Set(fonts)).toEqual(new Set(['localhost:4173']));
  });
});

test('the player is usable within a few seconds of the page loading', async ({ page }) => {
  await stubSoundCloud(page);
  const start = Date.now();
  await page.goto('/');
  await playerReady(page);
  await expect(
    page.getByRole('banner').first().getByRole('button', { name: 'Play' }),
  ).toBeEnabled();
  // Generous on purpose: this catches a stuck loading state, not a few hundred milliseconds.
  expect(Date.now() - start).toBeLessThan(10_000);
});
