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

export function widgetSrc(profileUrl: string): string {
  const params = new URLSearchParams({
    url: profileUrl,
    auto_play: 'false',
    visual: 'false',
    show_comments: 'false',
    show_teaser: 'false',
  });
  return `https://w.soundcloud.com/player/?${params}`;
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
