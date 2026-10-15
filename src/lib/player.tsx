import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { releases, type Release } from '@/content/releases';
import {
  artwork,
  loadWidgetApi,
  widgetOptions,
  widgetSrc,
  type ScSound,
  type ScWidget,
} from './soundcloud';

type Status = 'off' | 'loading' | 'ready' | 'error';

type Player = {
  /** The release the player has loaded. */
  album: Release;
  /** Cover art for each release the player has loaded so far, by release id. */
  albumArt: Record<string, string>;
  /**
   * Loads another release, or keeps the current one, and plays it when `autoPlay` is set. Only
   * ever called from a visitor's click, so it never starts sound on its own.
   */
  loadAlbum: (id: string, autoPlay?: boolean) => void;
  status: Status;
  tracks: ScSound[];
  current: number;
  playing: boolean;
  progress: number;
  /** 0 to 100, as the SoundCloud widget counts it. */
  volume: number;
  setVolume: (volume: number) => void;
  play: (index?: number) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
};

const PlayerContext = createContext<Player | null>(null);

const first = releases[0];

/**
 * One hidden SoundCloud widget, shared by the top transport bar, the console and the Catalog. It
 * starts with the first release loaded; picking another in the Catalog swaps the widget over to it,
 * and everything reading the player follows. Nothing plays until a visitor clicks something.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const widget = useRef<ScWidget | null>(null);
  // Each load gets a number, so a slow answer for an album the visitor has since left is ignored.
  const loadId = useRef(0);
  const [albumId, setAlbumId] = useState(first?.id);
  const [albumArt, setAlbumArt] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>(first?.playerUrl ? 'loading' : 'off');
  const [tracks, setTracks] = useState<ScSound[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(80);

  const album = releases.find((r) => r.id === albumId) ?? first;
  // The album the widget is on, for listeners bound once.
  const albumRef = useRef(album?.id);

  // The visitor's volume carries over to the next album.
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // The load the widget has finished, whether by `load`'s callback or a READY event, so only the
  // first of the two counts; and whether that load should start playing once it has.
  const settled = useRef(-1);
  const autoPlayRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  /**
   * Reads the loaded set's sounds into state, remembering its art. Long sets hand over their later
   * tracks without details at first, so those borrow the printed titles and get asked for again
   * until every one has arrived. Every sound stays in the list, keeping indexes in step with the
   * widget's.
   */
  const readSounds = (w: ScWidget, id: number, attempt = 0) =>
    w.getSounds((sounds) => {
      if (id !== loadId.current) return;
      const printed = releases.find((r) => r.id === albumRef.current)?.tracks ?? [];
      setTracks(
        sounds.map((s, i) => (s.title ? s : { ...s, title: printed[i] ?? `Track ${i + 1}` })),
      );
      const art = sounds[0]?.title ? artwork(sounds[0]) : null;
      const key = albumRef.current;
      if (art && key) setAlbumArt((a) => (a[key] === art ? a : { ...a, [key]: art }));
      if (sounds.some((s) => !s.title || !s.duration) && attempt < 8) {
        later(() => readSounds(w, id, attempt + 1), 1200);
      }
    });

  /** The widget has the album for load `id`: read it, open it up, and play it if asked to. */
  const ready = (w: ScWidget, id: number) => {
    if (id !== loadId.current || settled.current === id) return;
    settled.current = id;
    clearTimers();
    readSounds(w, id);
    setStatus('ready');
    if (id === 0) w.getVolume((v) => typeof v === 'number' && setVolumeState(Math.round(v)));
    else w.setVolume(volumeRef.current);
    if (autoPlayRef.current) w.play();
  };
  // The READY listener is bound once, so it reaches `ready` through a ref.
  const readyRef = useRef(ready);
  useEffect(() => {
    readyRef.current = ready;
  });

  useEffect(() => {
    if (!first?.playerUrl || !frame.current) return;
    const iframe = frame.current;
    let cancelled = false;

    loadWidgetApi()
      .then((SC) => {
        if (cancelled) return;
        const w = SC.Widget(iframe);
        widget.current = w;
        const { READY, PLAY, PAUSE, FINISH, PLAY_PROGRESS, ERROR } = SC.Widget.Events;
        const syncIndex = () => w.getCurrentSoundIndex((i) => setCurrent(i));

        // Fires for the first album, and again each time `load` swaps another in.
        w.bind(READY, () => readyRef.current(w, loadId.current));
        w.bind(PLAY, () => {
          setPlaying(true);
          syncIndex();
        });
        w.bind(PAUSE, () => setPlaying(false));
        w.bind(FINISH, () => setPlaying(false));
        w.bind(PLAY_PROGRESS, (e) => setProgress(e?.relativePosition ?? 0));
        w.bind(ERROR, () => setStatus('error'));
      })
      .catch(() => !cancelled && setStatus('error'));

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const loadAlbum = (id: string, autoPlay = false) => {
    const w = widget.current;
    const next = releases.find((r) => r.id === id);
    if (!w || !next) return;
    if (id === albumRef.current) {
      if (autoPlay && settled.current === loadId.current) w.play();
      else autoPlayRef.current ||= autoPlay;
      return;
    }
    const thisLoad = ++loadId.current;
    clearTimers();
    albumRef.current = id;
    autoPlayRef.current = autoPlay;
    setAlbumId(id);
    setStatus('loading');
    setTracks([]);
    setCurrent(0);
    setProgress(0);
    setPlaying(false);
    w.load(next.playerUrl, { ...widgetOptions(autoPlay), callback: () => ready(w, thisLoad) });
    // If the widget never answers, say so instead of leaving Play greyed out.
    later(() => {
      if (thisLoad === loadId.current && settled.current !== thisLoad) setStatus('error');
    }, 15000);
  };

  const play = useCallback((index?: number) => {
    const w = widget.current;
    if (!w) return;
    if (index === undefined) return w.play();
    setCurrent(index);
    setProgress(0);
    w.skip(index);
  }, []);
  const pause = useCallback(() => widget.current?.pause(), []);
  const toggle = useCallback(() => widget.current?.toggle(), []);
  const next = useCallback(() => widget.current?.next(), []);
  const prev = useCallback(() => widget.current?.prev(), []);
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    setVolumeState(clamped);
    widget.current?.setVolume(clamped);
  }, []);

  return (
    <PlayerContext
      value={{
        album,
        albumArt,
        loadAlbum,
        status,
        tracks,
        current,
        playing,
        progress,
        volume,
        setVolume,
        play,
        pause,
        toggle,
        next,
        prev,
      }}
    >
      {children}
      {first?.playerUrl && (
        <iframe
          ref={frame}
          src={widgetSrc(first.playerUrl)}
          title="SoundCloud player"
          allow="autoplay"
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'fixed',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            bottom: 0,
          }}
        />
      )}
    </PlayerContext>
  );
}

export function usePlayer(): Player {
  const player = useContext(PlayerContext);
  if (!player) throw new Error('usePlayer must be used inside PlayerProvider');
  return player;
}
