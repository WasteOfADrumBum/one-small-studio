import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  IconBrandSoundcloud,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from '@tabler/icons-react';
import { featuredAlbum } from '@/lib/site';
import { usePower } from '@/lib/power';
import { usePlayer } from '@/lib/player';
import { artwork, formatTime } from '@/lib/soundcloud';
import { Knob } from './hardware/Knob';
import { LedMeter } from './hardware/LedMeter';
import { Fader } from './hardware/Fader';
import { Led } from './hardware/Led';
import { Screw } from './hardware/Screw';
import { TrackList } from './TrackList';
import classes from './Console.module.css';

gsap.registerPlugin(useGSAP);

// Where each knob in the two banks settles when the console powers on, in degrees from twelve
// o'clock: left bank first, then right.
const SETTLE = [95, 20, 60, -10, 35, -40, 80, 5];

/** Degrees of jog-wheel travel per track. */
const DETENT = 36;

/**
 * The One Small controller, shaped like a compact dock: an angled tablet display between two knob
 * banks, one long fader for the master volume, a jog wheel that picks the track, and grouped
 * function and transport keys. Nothing plays until the visitor presses Play, Power, a track or
 * turns the wheel.
 */
export function Console() {
  const root = useRef<HTMLDivElement>(null);
  const { powered, setPowered } = usePower();
  const player = usePlayer();
  const reduceMotion = useReducedMotion();
  const ready = player.status === 'ready' && player.tracks.length > 0;

  // The click on Power is the visitor's opt-in to sound, so the album starts here when it can.
  const onPower = () => {
    const on = !powered;
    setPowered(on);
    if (on && ready) player.play();
    if (!on) player.pause();
  };
  const onPlay = () => {
    if (!player.playing) setPowered(true);
    player.toggle();
  };

  // Power sweep: caps swing up past their mark and settle, or fall back to zero when switched off.
  useGSAP(
    () => {
      gsap.utils.toArray<SVGGElement>('[data-knob-cap]').forEach((cap, i) => {
        gsap.to(cap, {
          svgOrigin: '50 50',
          rotation: powered ? SETTLE[i % SETTLE.length] : -135,
          duration: reduceMotion ? 0 : powered ? 1.4 : 0.6,
          delay: powered && !reduceMotion ? i * 0.08 : 0,
          ease: powered ? 'elastic.out(1, 0.55)' : 'power2.in',
        });
      });
    },
    { scope: root, dependencies: [powered, reduceMotion] },
  );

  return (
    <div className={classes.desk}>
      <div
        ref={root}
        className={classes.dock}
        data-powered={powered || undefined}
        role="group"
        aria-label="Console"
      >
        <div className={classes.chassis}>
          <div className={classes.deck}>
            <div className={classes.rear}>
              <KnobBank />
              <div className={classes.stand}>
                <Screen powered={powered} />
              </div>
              <KnobBank />
            </div>

            <div className={classes.surface}>
              <div className={classes.faderBay}>
                <Fader
                  label="Master volume"
                  caption="Master"
                  value={player.volume}
                  onChange={player.setVolume}
                  disabled={!ready}
                />
                <LedMeter
                  active={player.playing}
                  speed={1.2}
                  scale={player.volume / 100}
                  segments={18}
                  className={classes.meter}
                />
              </div>

              <div className={classes.groups}>
                <div className={classes.group} data-group="function">
                  <span className={classes.groupLabel} aria-hidden="true">
                    Function
                  </span>
                  <div className={classes.groupKeys}>
                    <span className={classes.keyWrap}>
                      <span className={classes.keyCaption} aria-hidden="true">
                        <Led on={powered} color="amber" />
                        {powered ? 'On' : 'Power'}
                      </span>
                      <button
                        type="button"
                        className={classes.key}
                        data-power
                        onClick={onPower}
                        aria-pressed={powered}
                        aria-label="Console power"
                      >
                        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                          <path d="M12 3v9" />
                          <path d="M6.3 7.2a8 8 0 1 0 11.4 0" />
                        </svg>
                      </button>
                    </span>
                    <span className={classes.keyWrap}>
                      <span className={classes.keyCaption} aria-hidden="true">
                        SoundCloud
                      </span>
                      <a
                        className={classes.key}
                        data-wide
                        href={featuredAlbum.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconBrandSoundcloud size={18} aria-hidden="true" />
                        Open on SoundCloud
                      </a>
                    </span>
                  </div>
                </div>

                <div className={classes.group} data-group="transport">
                  <span className={classes.groupLabel} aria-hidden="true">
                    Transport
                  </span>
                  <div className={classes.groupKeys}>
                    <TransportKey
                      label="Previous track"
                      caption="Prev"
                      onClick={player.prev}
                      disabled={!ready}
                    >
                      <IconPlayerSkipBackFilled size={18} />
                    </TransportKey>
                    <TransportKey
                      label={player.playing ? 'Pause' : 'Play'}
                      caption={player.playing ? 'Pause' : 'Play'}
                      onClick={onPlay}
                      disabled={!ready}
                      primary
                      lit={player.playing}
                    >
                      {player.playing ? (
                        <IconPlayerPauseFilled size={26} />
                      ) : (
                        <IconPlayerPlayFilled size={26} />
                      )}
                    </TransportKey>
                    <TransportKey
                      label="Next track"
                      caption="Next"
                      onClick={player.next}
                      disabled={!ready}
                    >
                      <IconPlayerSkipForwardFilled size={18} />
                    </TransportKey>
                  </div>
                </div>
              </div>

              <JogWheel ready={ready} />
            </div>
          </div>

          <div className={classes.front} aria-hidden="true">
            <Screw size={9} turn={20} />
            <span className={classes.nameplate}>
              One <b>Small</b> Studio
            </span>
            <Screw size={9} turn={-35} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Four display knobs beside the tablet. They only move with the power sweep. */
function KnobBank() {
  return (
    <div className={classes.knobBank} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={classes.bankKnob}>
          <Knob size={40} />
          <i />
        </span>
      ))}
    </div>
  );
}

/**
 * The jog wheel picks the track: turn it by dragging round, or use the arrow keys, Home and End.
 * Each detent cues the next or previous track and plays it.
 */
function JogWheel({ ready }: { ready: boolean }) {
  const { tracks, current, play } = usePlayer();
  const { setPowered } = usePower();
  const [turn, setTurn] = useState(0);
  const target = useRef(current);
  const drag = useRef<{ angle: number; travel: number } | null>(null);
  const count = tracks.length;

  useEffect(() => {
    if (!drag.current) target.current = current;
  }, [current]);

  const cue = (index: number) => {
    if (!ready) return;
    const next = Math.max(0, Math.min(count - 1, index));
    if (next === target.current) return;
    const steps = next - target.current;
    setTurn((t) => t + steps * DETENT);
    target.current = next;
    setPowered(true);
    play(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: target.current + 1,
      ArrowUp: target.current + 1,
      ArrowLeft: target.current - 1,
      ArrowDown: target.current - 1,
      Home: 0,
      End: count - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    cue(moves[e.key]);
  };

  const angleOf = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return (
      (Math.atan2(e.clientY - box.top - box.height / 2, e.clientX - box.left - box.width / 2) *
        180) /
      Math.PI
    );
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { angle: angleOf(e), travel: 0 };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const angle = angleOf(e);
    // Shortest way round, so crossing the ±180° seam doesn't jump.
    const delta = ((angle - d.angle + 540) % 360) - 180;
    d.angle = angle;
    d.travel += delta;
    if (Math.abs(d.travel) >= DETENT) {
      const step = Math.sign(d.travel);
      d.travel -= step * DETENT;
      if (target.current + step >= 0 && target.current + step < count) {
        target.current += step;
        setPowered(true);
        play(target.current);
      }
    }
    setTurn((t) => t + delta);
  };
  const endDrag = () => {
    drag.current = null;
  };

  const shown = Math.min(current, Math.max(0, count - 1));
  const title = tracks[shown]?.title;

  return (
    <div className={classes.jogBay}>
      <div
        className={classes.jog}
        role="slider"
        tabIndex={ready ? 0 : -1}
        aria-label="Jog wheel, choose a track"
        aria-disabled={!ready || undefined}
        aria-valuemin={1}
        aria-valuemax={Math.max(1, count)}
        aria-valuenow={shown + 1}
        aria-valuetext={title ? `Track ${shown + 1} of ${count}, ${title}` : 'No tracks loaded'}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className={classes.jogPlatter} style={{ rotate: `${turn}deg` }} aria-hidden="true">
          <span className={classes.jogDimple} />
        </span>
      </div>
      <span className={classes.jogReadout} aria-hidden="true">
        <span className="label">Jog · Track</span>
        <span className={classes.jogNum}>
          {count ? `${String(shown + 1).padStart(2, '0')}/${String(count).padStart(2, '0')}` : '--'}
        </span>
      </span>
    </div>
  );
}

type TransportKeyProps = {
  label: string;
  caption: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  lit?: boolean;
  children: ReactNode;
};

function TransportKey({
  label,
  caption,
  onClick,
  disabled,
  primary,
  lit,
  children,
}: TransportKeyProps) {
  return (
    <span className={classes.keyWrap} data-primary={primary || undefined}>
      <span className={classes.keyCaption} aria-hidden="true">
        {primary && <Led on={!!lit} color="green" />}
        {caption}
      </span>
      <button
        type="button"
        className={classes.key}
        data-primary={primary || undefined}
        data-lit={lit || undefined}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {children}
      </button>
    </span>
  );
}

/** The tablet in its cradle: what's loaded, what's playing, and the tracklist. */
function Screen({ powered }: { powered: boolean }) {
  const { status, tracks, current, playing, progress } = usePlayer();
  const track = tracks[current];
  const cover = tracks[0] ? artwork(tracks[0]) : null;
  const ready = status === 'ready' && tracks.length > 0;

  const state =
    status === 'loading'
      ? 'Loading'
      : status === 'error' || status === 'off'
        ? 'Offline'
        : playing
          ? 'Playing'
          : progress > 0
            ? 'Paused'
            : powered
              ? 'Cued'
              : 'Standby';

  const hint = !powered
    ? `Press Play or Power to spin ${featuredAlbum.title}. Nothing plays until you do.`
    : playing
      ? 'On air. The transport up top follows you down the page.'
      : 'The console is live. Pick a track or press Play.';

  return (
    <div className={classes.housing}>
      <span className={classes.camera} aria-hidden="true" />
      <div className={classes.screen} data-on={powered || undefined}>
        <div className={classes.statusBar}>
          <span className={classes.state} data-state={state}>
            <span className={classes.stateDot} aria-hidden="true" />
            {state}
          </span>
          <span className={classes.statusAlbum}>{featuredAlbum.title}</span>
          {ready && (
            <span className={classes.statusPos}>
              {String(current + 1).padStart(2, '0')}/{String(tracks.length).padStart(2, '0')}
            </span>
          )}
        </div>

        <div className={classes.screenBody}>
          <div className={classes.nowPlaying}>
            {cover ? (
              <img src={cover} alt={`${featuredAlbum.title} cover art`} className={classes.cover} />
            ) : (
              <span className={classes.cover} aria-hidden="true" />
            )}
            <div className={classes.npText}>
              <span className="label">{playing ? 'Now playing' : 'Loaded'}</span>
              <span className={classes.npTitle}>{track?.title ?? featuredAlbum.title}</span>
              <span className={classes.npArtist}>{featuredAlbum.artist}</span>
              <div className={classes.timeline} aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </div>
              {track && (
                <span className={classes.npTime}>
                  {formatTime(progress * track.duration)} / {formatTime(track.duration)}
                </span>
              )}
            </div>
          </div>
          <div className={classes.trackPane}>
            <TrackList variant="screen" label={`${featuredAlbum.title} tracklist`} />
          </div>
        </div>

        <p className={classes.hint}>{hint}</p>
      </div>
    </div>
  );
}
