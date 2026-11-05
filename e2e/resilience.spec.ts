import { expect, playerReady, stubSoundCloud, test } from './fixtures';
import { test as raw } from '@playwright/test';

/**
 * How the site behaves when the outside world does not: SoundCloud blocked or silent, a dropped
 * connection on the talkback form, and visitors who ask for less motion.
 */
raw.describe('when SoundCloud is unavailable', () => {
  raw('a blocked widget script falls back to a SoundCloud link @critical', async ({ page }) => {
    await page.route(/soundcloud\.com/, (r) => r.abort());
    await page.goto('/');
    const bar = page.getByRole('banner').first();
    await expect(bar.getByText('SoundCloud is not responding')).toBeVisible();
    await expect(page.getByText('SoundCloud is not answering right now.').first()).toBeAttached();
    await expect(page.getByRole('link', { name: 'Listen there instead' }).first()).toHaveAttribute(
      'href',
      /soundcloud\.com/,
    );
  });

  raw('a widget that never answers stops saying Loading', async ({ page }) => {
    await page.clock.install();
    // The script loads, but the player inside the iframe never reports ready.
    await page.route('https://w.soundcloud.com/player/api.js', (r) =>
      r.fulfill({
        contentType: 'text/javascript',
        body: `window.SC = { Widget: Object.assign(function () { return { bind: function () {}, unbind: function () {} }; }, { Events: { READY: 'ready', PLAY: 'play', PAUSE: 'pause', FINISH: 'finish', PLAY_PROGRESS: 'progress', ERROR: 'error' } }) };`,
      }),
    );
    await page.route(/w\.soundcloud\.com\/player\/\?/, (r) =>
      r.fulfill({ body: '<html></html>', contentType: 'text/html' }),
    );
    await page.route(
      (url) => url.hostname === 'soundcloud.com' && url.pathname === '/oembed',
      (r) => r.fulfill({ status: 404, body: '' }),
    );
    await page.goto('/');
    const bar = page.getByRole('banner').first();
    await expect(bar.getByText(/^Loading /)).toBeVisible();
    await page.clock.runFor(16_000);
    await expect(bar.getByText('SoundCloud is not responding')).toBeVisible();
  });
});

test.describe('keyboard', () => {
  test('the transport plays and pauses from the keyboard', async ({ site, isMobile }) => {
    test.skip(isMobile, 'Tab order is a keyboard concern');
    const bar = site.getByRole('banner').first();
    const play = bar.getByRole('button', { name: 'Play' });
    await play.focus();
    await site.keyboard.press('Enter');
    await expect(bar.getByText('Now playing')).toBeVisible();
    const pause = bar.getByRole('button', { name: 'Pause' });
    await expect(pause).toBeFocused();
    await site.keyboard.press('Space');
    await expect(bar.getByText('Cued')).toBeVisible();
  });
});

test.describe('talkback on a bad connection', () => {
  const fill = async (site: import('@playwright/test').Page) => {
    const form = site.locator('#contact');
    await form.getByRole('textbox', { name: 'Name' }).fill('Sam');
    await form.getByRole('textbox', { name: 'Email' }).fill('sam@example.com');
    await form
      .getByRole('textbox', { name: 'Message' })
      .fill('Loved the drum sound on that record.');
    await form.getByRole('button', { name: 'Send it' }).click();
    return form;
  };

  test('a dropped connection says so and keeps the message', async ({ site }) => {
    await site.route('/api/contact', (r) => r.abort());
    const form = await fill(site);
    await expect(form.getByRole('alert')).toContainText('Check your connection');
    await expect(form.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'Loved the drum sound on that record.',
    );
  });

  test('a rate-limited sender sees the reason', async ({ site }) => {
    await site.route('/api/contact', (r) =>
      r.fulfill({
        status: 429,
        json: { error: 'That is a lot of messages. Try again in an hour.' },
      }),
    );
    const form = await fill(site);
    await expect(form.getByRole('alert')).toContainText('Try again in an hour');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no looping animation runs when the visitor asks for less motion', async ({ site }) => {
    await site.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await site.waitForTimeout(300);
    const looping = await site.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity)
        .map((a) => (a as CSSAnimation).animationName ?? 'script'),
    );
    expect(looping).toEqual([]);
  });
});

raw.describe('slow or broken SoundCloud pieces', () => {
  raw('a player iframe that fails to load is reported, not left on Loading', async ({ page }) => {
    await page.clock.install();
    await stubSoundCloud(page, { readyAfter: -1 });
    // The real widget only answers from inside its iframe; with the iframe blocked it never does.
    await page.route(/w\.soundcloud\.com\/player\/\?/, (r) => r.abort());
    await page.goto('/');
    const bar = page.getByRole('banner').first();
    await expect(bar.getByText(/^Loading /)).toBeVisible();
    await page.clock.runFor(16_000);
    await expect(bar.getByText('SoundCloud is not responding')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Listen there instead' }).first()).toBeAttached();
  });

  raw('a widget that is slow to start recovers once it answers', async ({ page }) => {
    await page.clock.install();
    await stubSoundCloud(page, { readyAfter: 20_000 });
    await page.goto('/');
    const bar = page.getByRole('banner').first();
    await page.clock.runFor(16_000);
    await expect(bar.getByText('SoundCloud is not responding')).toBeVisible();
    await page.clock.runFor(5_000);
    await expect(bar.getByText('Cued')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Play' })).toBeEnabled();
  });

  raw('cover art lookups that fail leave the shelf usable', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await stubSoundCloud(page);
    await page.route(
      (url) => url.hostname === 'soundcloud.com' && url.pathname === '/oembed',
      (r) => r.abort(),
    );
    await page.goto('/');
    await playerReady(page);
    const shelf = page.locator('#catalog').getByRole('list', { name: 'Releases' });
    await expect(shelf.getByRole('button')).toHaveCount(5);
    await shelf.getByRole('button', { name: /untranslated/ }).click();
    await expect(page.locator('#catalog').getByRole('heading', { level: 3 })).toHaveText(
      'untranslated',
    );
    expect(errors).toEqual([]);
  });

  raw(
    'switching records while one is still loading settles on the last one picked',
    async ({ page }) => {
      await page.clock.install();
      // Album switches never finish, so the visitor keeps picking while the widget is busy.
      await stubSoundCloud(page, { loadAfter: -1 });
      await page.goto('/');
      await page.clock.runFor(100);
      await playerReady(page);
      const catalog = page.locator('#catalog');
      await catalog.getByRole('button', { name: /When the Stones Weep/ }).click();
      await catalog.getByRole('button', { name: /untranslated/ }).click();
      await expect(catalog.getByRole('heading', { level: 3 })).toHaveText('untranslated');
      await expect(catalog.getByRole('button', { name: /untranslated/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      // Neither load finished, so the watchdog reports it instead of waiting forever.
      await page.clock.runFor(16_000);
      await expect(
        page.getByRole('banner').first().getByText('SoundCloud is not responding'),
      ).toBeVisible();
    },
  );
});
