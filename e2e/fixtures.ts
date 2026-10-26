import { test as base, type Page } from '@playwright/test';

/**
 * A stand-in for SoundCloud's Widget API with six tracks, so the player works with no network.
 * It runs inside the page, so it is written as plain browser JavaScript.
 */
const WIDGET_STUB = `
window.SC = { Widget: Object.assign(function () {
  var l = {}, playing = false, idx = 0;
  var sounds = [0, 1, 2, 3, 4, 5].map(function (i) {
    return { id: i + 1, title: 'Song ' + (i + 1), permalink_url: '#', artwork_url: null, duration: 180000 + i * 1000 };
  });
  function fire(e, a) { (l[e] || []).forEach(function (f) { f(a); }); }
  setTimeout(function () { fire('ready'); }, 30);
  return {
    bind: function (e, f) { (l[e] = l[e] || []).push(f); }, unbind: function (e) { delete l[e]; },
    play: function () { playing = true; fire('play'); }, pause: function () { playing = false; fire('pause'); },
    toggle: function () { playing ? this.pause() : this.play(); },
    next: function () { idx = Math.min(5, idx + 1); fire('play'); }, prev: function () { idx = Math.max(0, idx - 1); fire('play'); },
    skip: function (i) { idx = i; this.play(); },
    load: function (u, o) { setTimeout(function () { o.callback && o.callback(); }, 30); },
    setVolume: function () {}, getVolume: function (cb) { cb(80); },
    getSounds: function (cb) { cb(sounds); }, getCurrentSoundIndex: function (cb) { cb(idx); }
  };
}, { Events: { READY: 'ready', PLAY: 'play', PAUSE: 'pause', FINISH: 'finish', PLAY_PROGRESS: 'progress', ERROR: 'error' } }) };
`;

async function stubSoundCloud(page: Page) {
  await page.route('https://w.soundcloud.com/player/api.js', (r) =>
    r.fulfill({ body: WIDGET_STUB, contentType: 'text/javascript' }),
  );
  await page.route(/w\.soundcloud\.com\/player\/\?/, (r) =>
    r.fulfill({ body: '<html></html>', contentType: 'text/html' }),
  );
  await page.route(/soundcloud\.com\/oembed/, (r) => r.fulfill({ status: 404, body: '' }));
}

/** The home page with SoundCloud stubbed and the player loaded. */
export const test = base.extend<{ site: Page }>({
  site: async ({ page }, use) => {
    await stubSoundCloud(page);
    await page.goto('/');
    await page
      .getByRole('list', { name: /tracklist/ })
      .first()
      .getByRole('button')
      .first()
      .waitFor();
    await use(page);
  },
});

export { expect } from '@playwright/test';
