/**
 * Typings and loader for the SoundCloud Widget API (https://developers.soundcloud.com/docs/api/html5-widget).
 * The widget is an iframe player we drive with postMessage; it needs no API key.
 */
export type ScSound = {
  id: number;
  title: string;
  permalink_url: string;
  artwork_url: string | null;
  duration: number;
  genre?: string;
  user?: { username: string; avatar_url?: string };
};

type Callback<T> = (value: T) => void;

export type ScWidget = {
  bind(event: string, listener: (e?: { relativePosition?: number }) => void): void;
  unbind(event: string): void;
  play(): void;
  pause(): void;
  toggle(): void;
  next(): void;
  prev(): void;
  skip(index: number): void;
  /** Swaps in another sound or set; listeners stay bound, and `callback` runs once it is ready. */
  load(url: string, options: Record<string, unknown> & { callback?: () => void }): void;
  /** 0 to 100. */
  setVolume(volume: number): void;
  getVolume(cb: Callback<number>): void;
  getSounds(cb: Callback<ScSound[]>): void;
  getCurrentSoundIndex(cb: Callback<number>): void;
};

type ScGlobal = {
  Widget: ((iframe: HTMLIFrameElement) => ScWidget) & {
    Events: Record<'READY' | 'PLAY' | 'PAUSE' | 'FINISH' | 'PLAY_PROGRESS' | 'ERROR', string>;
  };
};

declare global {
  interface Window {
    SC?: ScGlobal;
  }
}

const SCRIPT_URL = 'https://w.soundcloud.com/player/api.js';
let loading: Promise<ScGlobal> | null = null;

export function loadWidgetApi(): Promise<ScGlobal> {
  if (window.SC) return Promise.resolve(window.SC);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.SC ? resolve(window.SC) : reject(new Error('SoundCloud API missing'));
    script.onerror = () => {
      loading = null;
      reject(new Error('Could not load the SoundCloud player'));
    };
    document.head.append(script);
  });
  return loading;
}

export function widgetSrc(url: string): string {
  const params = new URLSearchParams({
    url,
    auto_play: 'false',
    visual: 'false',
    show_comments: 'false',
    show_teaser: 'false',
  });
  return `https://w.soundcloud.com/player/?${params}`;
}

/** Options for `ScWidget.load`, matching the iframe's own. */
export function widgetOptions(autoPlay: boolean) {
  return { auto_play: autoPlay, visual: false, show_comments: false, show_teaser: false };
}

type OEmbed = { thumbnail_url?: string; html?: string };
const oembeds = new Map<string, Promise<OEmbed | null>>();

/** SoundCloud's oEmbed answer for a page URL, secret links included; asked once per URL. */
export function oembed(pageUrl: string): Promise<OEmbed | null> {
  let answer = oembeds.get(pageUrl);
  if (!answer) {
    const url = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(pageUrl)}`;
    answer = fetch(url)
      .then((res) => (res.ok ? (res.json() as Promise<OEmbed>) : null))
      .catch(() => null);
    answer.then((a) => a ?? oembeds.delete(pageUrl));
    oembeds.set(pageUrl, answer);
  }
  return answer;
}

/**
 * The URL the widget should load for a release. A private set's page link isn't enough for the
 * widget; its embed code names the set by API URL with the secret token, so read that from oEmbed.
 * API URLs pass straight through, and anything that can't be resolved falls back to the link.
 */
export async function widgetUrl(url: string): Promise<string> {
  if (url.startsWith('https://api.soundcloud.com/')) return url;
  const html = (await oembed(url))?.html ?? '';
  const src = /src="([^"]+)"/.exec(html)?.[1]?.replaceAll('&amp;', '&');
  try {
    return (src && new URL(src).searchParams.get('url')) || url;
  } catch {
    return url;
  }
}

/** SoundCloud serves 100px art by default; ask for the 500px version. */
export function artwork(sound: ScSound): string | null {
  const url = sound.artwork_url ?? sound.user?.avatar_url ?? null;
  return url ? url.replace('-large.', '-t500x500.') : null;
}

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
