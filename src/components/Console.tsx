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

// Where each knob in the two towers settles when the console powers on, in degrees from twelve
// o'clock: left bank first, then right.
const SETTLE = [95, 20, 60, -10, 35, -40, 80, 5];

/** Degrees of jog-wheel travel per track. */
const DETENT = 36;

// Legends printed either side of the two key blocks, as on the Dock: one per row, top to bottom,
// outside edge first, then the side facing the wheel. Blank where the Dock prints none.
const LEFT_LEGENDS = {
  outer: ['Preview', 'Punch Preview', 'Suspend Preview', 'Capture', 'Punch Capture', 'Auto Match'],
  inner: ['All/Sel', 'Start', 'End', 'Punch', 'Next', ''],
};
const RIGHT_LEGENDS = {
  outer: ['Nudge ▶', 'Scroll V', 'Mark Out', 'Do to All', '', ''],
  inner: ['◀ Nudge', 'Scroll H', 'Mark In', 'User 1', 'Workstation', 'User 2'],
};

/**
 * The One Small controller, laid out like a Pro Tools Dock: a tablet standing upright in its cradle
 * between two columns of four knobs; a soft-key band under it; the fader on the left, a big jog
 * wheel in the middle with key blocks either side and a touch strip to the right; a strip under the
 * wheel; and the transport row along the front. Only the fader, the wheel, the transport keys, Power
 * (where the monitor knob sits) and the SoundCloud key do anything; the rest is hardware dressing,
 * hidden from keyboard and screen readers. Nothing plays until the visitor asks.
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
        {/* Upper deck: knob towers either side of the docked tablet. */}
        <div className={classes.upper}>
          <KnobTower />
          <div className={classes.stand}>
            <span className={classes.bracket} aria-hidden="true" />
            <Screen powered={powered} />
            <span className={classes.cradle} aria-hidden="true">
              <span className={classes.cradleNotch} />
              <Wordmark className={classes.cradleBrand} />
              <span className={classes.cradleModel}>Dock</span>
            </span>
          </div>
          <KnobTower />
        </div>

        <div className={classes.chassis}>
          {/* Soft-key band; Power sits where the monitor knob does. */}
          <div className={classes.softBand}>
            <span className={classes.pairKeys} aria-hidden="true">
              <i data-light={powered ? 'red' : undefined} />
              <i data-light={powered ? 'violet' : undefined} />
            </span>
            <span className={classes.softKeys} aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                // Every lens glows a steady violet while the console is on; the top-row key over
                // the loaded track glows red instead, like a selected channel.
                <i
                  key={i}
                  data-light={powered ? (i === player.current ? 'red' : 'violet') : undefined}
                />
              ))}
            </span>
            <span className={classes.powerSpot}>
              <button
                type="button"
                className={classes.power}
                onClick={onPower}
                aria-pressed={powered}
                aria-label="Console power"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 3v9" />
                  <path d="M6.3 7.2a8 8 0 1 0 11.4 0" />
                </svg>
              </button>
              <span className={classes.powerCaption} aria-hidden="true">
                <Led on={powered} color="amber" />
                {powered ? 'On' : 'Power'}
              </span>
            </span>
          </div>

          {/* Centre section: fader, key block, jog wheel, key block, touch strip. */}
          <div className={classes.centre}>
            <div className={classes.faderBay}>
              <LedMeter
                active={player.playing}
                speed={1.2}
                scale={player.volume / 100}
                segments={14}
                className={classes.meter}
              />
              <Fader
                label="Master volume"
                caption="Master"
                value={player.volume}
                onChange={player.setVolume}
                disabled={!ready}
              />
            </div>
            <KeyBlock legends={LEFT_LEGENDS} side="left" />
            <div className={classes.jogArea}>
              <JogWheel ready={ready} />
            </div>
            <KeyBlock legends={RIGHT_LEGENDS} side="right" />
            <span className={classes.stripBay} aria-hidden="true">
              <span className={classes.vStrip}>
                <i />
                <i />
                <i />
                <i />
              </span>
            </span>
          </div>

          {/* The strip under the wheel shows how far into the track playback is. */}
          <span className={classes.hStrip} aria-hidden="true">
            <span style={{ transform: `scaleX(${player.progress})` }} />
            <i />
            <i />
            <i />
          </span>

          {/* Transport row along the front edge. */}
          <div className={classes.transport}>
            <TransportKey
              label="Previous track"
              caption="Previous"
              onClick={player.prev}
              disabled={!ready}
            >
              <IconPlayerSkipBackFilled size={16} />
            </TransportKey>
            <TransportKey
              label={player.playing ? 'Pause' : 'Play'}
              caption="Play"
              onClick={onPlay}
              disabled={!ready}
              primary
              lit={player.playing}
            >
              {player.playing ? (
                <IconPlayerPauseFilled size={22} />
              ) : (
                <IconPlayerPlayFilled size={22} />
              )}
            </TransportKey>
            <TransportKey label="Next track" caption="Next" onClick={player.next} disabled={!ready}>
              <IconPlayerSkipForwardFilled size={16} />
            </TransportKey>
            <span className={classes.keyWrap}>
              <span className={classes.keyCaption} aria-hidden="true">
                Listen
              </span>
              <a
                className={classes.key}
                data-wide
                href={featuredAlbum.pageUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className={classes.glyph} aria-hidden="true">
                  <IconBrandSoundcloud size={16} />
                </span>
                Open on SoundCloud
              </a>
            </span>
          </div>

          <div className={classes.footer} aria-hidden="true">
            <span className={classes.shift} />
            <Wordmark className={classes.nameplate} />
            <span className={classes.shift} />
          </div>
        </div>

        {/* The palm rest along the front, with its own thickness and shadow. */}
        <div className={classes.front} aria-hidden="true">
          <Screw size={8} turn={20} />
          <Screw size={8} turn={-35} />
        </div>
      </div>
    </div>
  );
}

/**
 * The brand as it is printed on the hardware: three words of one face, size and weight on one
 * baseline, with only the colour of "Small" set apart. Its size comes from where it is used.
 */
function Wordmark({ className }: { className: string }) {
  return (
    <span className={`${classes.wordmark} ${className}`}>
      One <span className={classes.wordmarkAccent}>Small</span> Studio
    </span>
  );
}

/** Four display knobs in a raised column beside the tablet. They only move with the power sweep. */
function KnobTower() {
  return (
    <div className={classes.tower} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={classes.towerSlot}>
          <Knob size={34} />
        </span>
      ))}
    </div>
  );
}

/**
 * Two columns of six keys with indicator strips, and their printed legends on both sides. Every row
 * uses the same columns (legend, key, key, legend), so each legend shares its key's centre line
 * and both legend columns keep their width even where a row has none. Dock dressing, not controls.
 */
function KeyBlock({
  legends,
  side,
}: {
  legends: { outer: string[]; inner: string[] };
  side: 'left' | 'right';
}) {
  const legend = (text: string) =>
    text ? <span className={classes.legend}>{text}</span> : <span />;
  return (
    <span className={classes.keyBlock} data-side={side} aria-hidden="true">
      {legends.inner.map((inner, row) => {
        const outer = legends.outer[row];
        return (
          <span key={row} className={classes.keyRow}>
            {side === 'left' ? legend(outer) : legend(inner)}
            <i />
            <i />
            {side === 'left' ? legend(inner) : legend(outer)}
          </span>
        );
      })}
    </span>
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
        {/* One fixed box for every icon, so swapping Play for Pause moves nothing. */}
        <span className={classes.glyph} aria-hidden="true">
          {children}
        </span>
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
