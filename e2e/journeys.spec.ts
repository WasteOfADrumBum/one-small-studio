import { readFileSync } from 'node:fs';
import { expect, playerReady, stubSoundCloud, test } from './fixtures';
import { test as raw } from '@playwright/test';

/** Records on the shelf after the first, which the player starts on. */
const releases = ['When the Stones Weep', 'untranslated'];

test.describe('home page', () => {
  test('loads with its sections, landmarks and navigation @critical', async ({
    site,
    isMobile,
  }) => {
    await expect(site).toHaveTitle('One Small Studio');
    await expect(site.getByRole('heading', { level: 1 })).toHaveAccessibleName('One Small Studio');
    await expect(site.getByRole('main')).toBeVisible();
    await expect(site.getByRole('banner').first()).toBeVisible();
    await expect(site.getByRole('contentinfo')).toBeAttached();
    for (const id of ['top', 'story', 'catalog', 'contact']) {
      await expect(site.locator(`section#${id}`)).toBeAttached();
    }
    // On phones the transport bar drops the wordmark for space (TransportBar.module.css); there
    // the page is one scroll and the browser's own controls get back to the top.
    if (isMobile) return;
    // The wordmark is the way home from anywhere on the page.
    await site.locator('#contact').scrollIntoViewIfNeeded();
    await site.getByRole('link', { name: 'One Small Studio, back to top' }).click();
    await expect(site).toHaveURL(/#top$/);
    await expect(site.locator('#top')).toBeInViewport();
  });

  test('the skip link takes keyboard focus past the transport @critical', async ({
    site,
    isMobile,
  }) => {
    test.skip(isMobile, 'Tab order is a keyboard concern');
    await site.keyboard.press('Tab');
    await expect(site.getByRole('link', { name: 'Skip to the story' })).toBeFocused();
    await site.keyboard.press('Enter');
    await expect(site).toHaveURL(/#story$/);
    // The next Tab lands inside the story, not back in the transport bar.
    await site.keyboard.press('Tab');
    const inStory = await site.evaluate(
      () => !!document.activeElement?.closest('#story, #story ~ *'),
    );
    expect(inStory).toBe(true);
  });

  test('every outside link opens in a new tab without handing over the opener', async ({
    site,
  }) => {
    const links = await site.locator('a[href^="http"]').evaluateAll((as) =>
      (as as HTMLAnchorElement[]).map((a) => ({
        href: a.href,
        target: a.target,
        rel: a.rel,
      })),
    );
    expect(links.length).toBeGreaterThan(5);
    for (const link of links) {
      expect(link.href, link.href).toMatch(/^https:\/\//);
      expect(link.target, link.href).toBe('_blank');
      expect(link.rel, link.href).toMatch(/noreferrer|noopener/);
    }
    const hosts = new Set(links.map((l) => new URL(l.href).host));
    expect([...hosts].sort()).toEqual(
      expect.arrayContaining([
        'onesmall.company',
        'photo.onesmall.company',
        'soundcloud.com',
        'www.linkedin.com',
      ]),
    );
  });
});

raw.describe('routes and metadata', () => {
  raw(
    'an unknown path serves the site, pointing search engines at the home page',
    async ({ page }) => {
      await stubSoundCloud(page);
      const res = await page.goto('/no-such-page');
      // Vercel rewrites every path to the single page (vercel.json), so this is a 200, and the
      // canonical link keeps search engines from indexing the stray path as a second copy.
      expect(res!.status()).toBe(200);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://studio.onesmall.company/',
      );
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    },
  );

  raw('an unknown API path is a JSON 404, not the page', async ({ request }) => {
    const res = await request.get('/api/no-such-thing');
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  raw('canonical, share tags, robots and sitemap agree on one address', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const meta = (attr: string, name: string) =>
      html.match(new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]+)"`))?.[1];
    const origin = 'https://studio.onesmall.company';
    expect(html).toContain(`<link rel="canonical" href="${origin}/" />`);
    expect(meta('property', 'og:url')).toBe(`${origin}/`);
    expect(meta('property', 'og:image')).toBe(`${origin}/og-image.png`);
    expect(meta('name', 'twitter:image')).toBe(`${origin}/og-image.png`);
    expect(meta('name', 'description')).toBeTruthy();

    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
    expect(robots).toContain('Disallow: /api/');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.headers()['content-type']).toMatch(/xml/);
    expect(await sitemap.text()).toContain(`<loc>${origin}/</loc>`);

    const image = await request.get('/og-image.png');
    expect(image.headers()['content-type']).toBe('image/png');
  });

  raw('the build says which commit it is', async ({ request }) => {
    const res = await request.get('/version.json');
    expect(res.headers()['cache-control']).toBe('no-store');
    const body = await res.json();
    expect(body.service).toBe('one-small-studio');
    const expected = process.env.GITHUB_SHA ?? null;
    expect(body.commit).toBe(expected);
  });
});

test.describe('player', () => {
  test('never plays until the visitor asks @critical', async ({ site }) => {
    await site.waitForTimeout(1500);
    const calls = await site.evaluate(
      () => (window as unknown as { __sc: { play: number; toggle: number; skip: number[] } }).__sc,
    );
    expect(calls.play + calls.toggle + calls.skip.length).toBe(0);
    await expect(site.getByRole('banner').first().getByText('Cued')).toBeVisible();
  });

  test('play, pause and repeated toggles end in the state the visitor chose @critical', async ({
    site,
  }) => {
    const bar = site.getByRole('banner').first();
    for (let i = 0; i < 5; i++) {
      await bar.getByRole('button', { name: /^(Play|Pause)$/ }).click();
    }
    // Five presses from paused: playing.
    await expect(bar.getByRole('button', { name: 'Pause' })).toBeVisible();
    await expect(bar.getByText('Now playing')).toBeVisible();
    await bar.getByRole('button', { name: 'Pause' }).click();
    await expect(bar.getByRole('button', { name: 'Play' })).toBeVisible();
    await expect(bar.getByText('Cued')).toBeVisible();
  });

  test('next and previous change the track and keep focus on the button', async ({
    site,
    isMobile,
  }) => {
    test.skip(isMobile, 'Focus continuity is a keyboard concern');
    const bar = site.getByRole('banner').first();
    const next = bar.getByRole('button', { name: 'Next track' });
    await next.focus();
    await site.keyboard.press('Enter');
    await expect(bar.getByText('Song 2')).toBeVisible();
    await expect(next).toBeFocused();
    await site.keyboard.press('Enter');
    await expect(bar.getByText('Song 3')).toBeVisible();
    const prev = bar.getByRole('button', { name: 'Previous track' });
    await prev.focus();
    await site.keyboard.press('Enter');
    await expect(bar.getByText('Song 2')).toBeVisible();
    await expect(prev).toBeFocused();
  });

  test('picking a track in the tracklist plays that track', async ({ site }) => {
    const list = site.getByRole('list', { name: /tracklist/ }).first();
    await list.getByRole('button').nth(3).click();
    const calls = await site.evaluate(
      () => (window as unknown as { __sc: { skip: number[] } }).__sc.skip,
    );
    expect(calls).toEqual([3]);
    await expect(site.getByRole('banner').first().getByText('Song 4')).toBeVisible();
  });

  test('switching records loads each one and shows which is playing @critical', async ({
    site,
  }) => {
    const catalog = site.locator('#catalog');
    for (const title of releases) {
      const record = catalog.getByRole('button', { name: new RegExp(title) });
      await record.click();
      await expect(record).toHaveAttribute('aria-pressed', 'true');
      await expect(catalog.getByRole('heading', { level: 3 })).toHaveText(title);
    }
    const loads = await site.evaluate(
      () => (window as unknown as { __sc: { load: string[] } }).__sc.load,
    );
    expect(loads).toHaveLength(2);
    for (const url of loads) expect(url).toMatch(/^https:\/\/api\.soundcloud\.com\/playlists\//);
  });
});

raw.describe('SoundCloud data is treated as text', () => {
  raw('a track title with markup is shown literally and runs nothing', async ({ page }) => {
    const hostile = '<img src=x onerror="window.__pwned=1">Song</b>';
    await stubSoundCloud(page, { titles: [hostile, 'Second'] });
    await page.goto('/');
    await playerReady(page);
    await expect(page.getByRole('list', { name: /tracklist/ }).first()).toContainText(hostile);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBe(
      undefined,
    );
    expect(await page.locator('img[src="x"]').count()).toBe(0);
  });
});

// Keep the test list honest: the release titles above must exist in the content.
raw('the journeys use the real catalog titles', () => {
  const content = readFileSync(new URL('../src/content/releases.ts', import.meta.url), 'utf8');
  for (const title of releases) expect(content).toContain(`'${title}'`);
});
