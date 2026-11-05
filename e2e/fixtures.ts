import { randomBytes } from 'node:crypto';
import { test as base, type Page, type Route } from '@playwright/test';

/**
 * A stand-in for SoundCloud's Widget API, so the player runs with no network and no real audio.
 *
 * What this proves: the site drives the widget interface correctly (binds events, waits for READY,
 * calls play/pause/skip, shows the right state). What it does not prove: that SoundCloud is
 * reachable (the scheduled smoke check looks at that) or that audio actually plays on a device
 * (manual check). Nothing here produces sound.
 *
 * It runs inside the page, so it is plain browser JavaScript. `window.__sc` records the calls the
 * site made, for tests to inspect.
 */
const WIDGET_STUB = `
(function () {
  var opts = window.__SC_STUB__ || {};
  var calls = window.__sc = { play: 0, pause: 0, toggle: 0, skip: [], load: [], bound: {}, unbound: [] };
  window.SC = { Widget: Object.assign(function () {
    var l = {}, playing = false, idx = 0;
    var titles = opts.titles || [0, 1, 2, 3, 4, 5].map(function (i) { return 'Song ' + (i + 1); });
    var sounds = titles.map(function (t, i) {
      return { id: i + 1, title: t, permalink_url: '#', artwork_url: null, duration: 180000 + i * 1000 };
    });
    function fire(e, a) { (l[e] || []).forEach(function (f) { f(a); }); }
    if (opts.readyAfter !== -1) setTimeout(function () { fire('ready'); }, opts.readyAfter || 30);
    return {
      bind: function (e, f) { calls.bound[e] = (calls.bound[e] || 0) + 1; (l[e] = l[e] || []).push(f); },
      unbind: function (e) { calls.unbound.push(e); delete l[e]; },
      play: function () { calls.play++; playing = true; fire('play'); },
      pause: function () { calls.pause++; playing = false; fire('pause'); },
      toggle: function () { calls.toggle++; playing ? (playing = false, fire('pause')) : (playing = true, fire('play')); },
      next: function () { idx = Math.min(sounds.length - 1, idx + 1); fire('play'); },
      prev: function () { idx = Math.max(0, idx - 1); fire('play'); },
      skip: function (i) { calls.skip.push(i); idx = i; playing = true; fire('play'); },
      load: function (u, o) {
        calls.load.push(u);
        if (opts.loadAfter === -1) return;
        setTimeout(function () { o.callback && o.callback(); }, opts.loadAfter || 30);
      },
      setVolume: function () {}, getVolume: function (cb) { cb(80); },
      getSounds: function (cb) { cb(sounds); }, getCurrentSoundIndex: function (cb) { cb(idx); }
    };
  }, { Events: { READY: 'ready', PLAY: 'play', PAUSE: 'pause', FINISH: 'finish', PLAY_PROGRESS: 'progress', ERROR: 'error' } }) };
})();
`;

export type StubOptions = {
  /** Track titles the widget reports. */
  titles?: string[];
  /** Milliseconds before the first READY; -1 never sends it. */
  readyAfter?: number;
  /** Milliseconds before an album switch finishes; -1 never finishes. */
  loadAfter?: number;
};

export async function stubSoundCloud(page: Page, opts: StubOptions = {}) {
  await page.addInitScript((o) => {
    (window as unknown as { __SC_STUB__: StubOptions }).__SC_STUB__ = o;
  }, opts);
  await page.route('https://w.soundcloud.com/player/api.js', (r) =>
    r.fulfill({ body: WIDGET_STUB, contentType: 'text/javascript' }),
  );
  await page.route(/w\.soundcloud\.com\/player\/\?/, (r) =>
    r.fulfill({ body: '<html></html>', contentType: 'text/html' }),
  );
  await page.route(
    (url) => url.hostname === 'soundcloud.com' && url.pathname === '/oembed',
    (r) => r.fulfill({ status: 404, body: '' }),
  );
}

/** Waits until the player has its tracklist. */
export async function playerReady(page: Page) {
  await page
    .getByRole('list', { name: /tracklist/ })
    .first()
    .getByRole('button')
    .first()
    .waitFor();
}

/**
 * Gives this test its own client address for the talkback API, as Vercel's edge would, so the
 * real rate limit counts each test separately. The request still goes over HTTP to the real
 * Express handler; only the forwarding header is added.
 */
export async function asClient(page: Page, address: string) {
  await page.route('/api/contact', (route: Route) =>
    route.continue({ headers: { ...route.request().headers(), 'x-forwarded-for': address } }),
  );
}

/** A client address and a message tag no other test uses, even across parallel workers. */
export function uniqueClient() {
  const b = randomBytes(4);
  return { address: `10.${b[0]}.${b[1]}.${b[2]}`, tag: `tag-${b.toString('hex')}-${Date.now()}` };
}

/** The home page with SoundCloud stubbed and the player loaded. */
export const test = base.extend<{ site: Page }>({
  site: async ({ page }, use) => {
    await stubSoundCloud(page);
    await page.goto('/');
    await playerReady(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
