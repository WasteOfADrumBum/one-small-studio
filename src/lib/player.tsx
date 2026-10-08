import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { featuredAlbum } from './site';
import { loadWidgetApi, widgetSrc, type ScSound, type ScWidget } from './soundcloud';

type Status = 'off' | 'loading' | 'ready' | 'error';

type Player = {
  status: Status;
  tracks: ScSound[];
  current: number;
  playing: boolean;
  progress: number;
  play: (index?: number) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
};

const PlayerContext = createContext<Player | null>(null);

/**
 * One hidden SoundCloud widget loaded with the featured album, shared by the top transport bar, the
 * hero's tracklist deck and the Catalog. Nothing plays until a visitor clicks something.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const widget = useRef<ScWidget | null>(null);
  const [status, setStatus] = useState<Status>(featuredAlbum.playerUrl ? 'loading' : 'off');
  const [tracks, setTracks] = useState<ScSound[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!featuredAlbum.playerUrl || !frame.current) return;
    const iframe = frame.current;
    let cancelled = false;
    let refetch: ReturnType<typeof setTimeout> | undefined;

    loadWidgetApi()
      .then((SC) => {
        if (cancelled) return;
        const w = SC.Widget(iframe);
        widget.current = w;
        const { READY, PLAY, PAUSE, FINISH, PLAY_PROGRESS, ERROR } = SC.Widget.Events;
        const syncIndex = () => w.getCurrentSoundIndex((i) => setCurrent(i));

        w.bind(READY, () => {
          const loadSounds = () =>
            w.getSounds((sounds) => setTracks(sounds.filter((s) => s.title)));
          loadSounds();
          // Long profiles fill in their track details lazily, so ask again once they have.
          refetch = setTimeout(loadSounds, 2500);
          setStatus('ready');
        });
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
      clearTimeout(refetch);
    };
  }, []);

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

  return (
    <PlayerContext
      value={{ status, tracks, current, playing, progress, play, pause, toggle, next, prev }}
    >
      {children}
      {featuredAlbum.playerUrl && (
        <iframe
          ref={frame}
          src={widgetSrc(featuredAlbum.playerUrl)}
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
