import { useRef, type ReactNode } from 'react';
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

// Where each channel's gain settles when the console powers on, in degrees from twelve o'clock.
const CHANNELS = [
  { label: 'Drums', settle: 95, speed: 0.9 },
  { label: 'Engineering', settle: 20, speed: 1.4 },
  { label: 'Live sound', settle: 60, speed: 1.1 },
  { label: 'Production', settle: -10, speed: 1.6 },
];

/**
 * The One Small console: four channel strips for the four jobs, a tilted display with the featured
 * album, transport keys, power and a master fader that really sets the volume. Nothing plays until
 * the visitor presses Play, Power or a track.
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
          rotation: powered ? CHANNELS[i].settle : -135,
          duration: reduceMotion ? 0 : powered ? 1.4 : 0.6,
          delay: powered && !reduceMotion ? i * 0.12 : 0,
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
        className={classes.console}
        data-powered={powered || undefined}
        role="group"
        aria-label="Console"
      >
        <span className={classes.cheek} data-side="left" aria-hidden="true" />

        <div className={classes.body}>
          <div className={classes.bridge}>
            <Screen powered={powered} />
          </div>

          <div className={classes.powerBay}>
            <button
              type="button"
              className={classes.power}
              onClick={onPower}
              aria-pressed={powered}
              aria-label="Console power"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path d="M12 3v9" />
                <path d="M6.3 7.2a8 8 0 1 0 11.4 0" />
              </svg>
            </button>
            <span className={classes.powerLabel}>
              <Led on={powered} color="amber" />
              <span className="label">{powered ? 'On' : 'Power'}</span>
            </span>
          </div>

          <div className={classes.strips} aria-hidden="true">
            {CHANNELS.map((channel, i) => (
              <div key={channel.label} className={classes.strip}>
                <span className={classes.chNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={classes.stripKnob}>
                  <Knob label="Gain" size={56} />
                </span>
                <LedMeter
                  active={player.playing}
                  speed={channel.speed}
                  className={classes.stripMeter}
                />
                <span className={classes.scribble}>{channel.label}</span>
              </div>
            ))}
          </div>

          <div className={classes.transport}>
            <span className="label" aria-hidden="true">
              Transport
            </span>
            <div className={classes.keys}>
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
                  <IconPlayerPauseFilled size={24} />
                ) : (
                  <IconPlayerPlayFilled size={24} />
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
            <a
              className={classes.scKey}
              href={featuredAlbum.pageUrl}
              target="_blank"
              rel="noreferrer"
            >
              <IconBrandSoundcloud size={18} aria-hidden="true" />
              Open on SoundCloud
            </a>
          </div>

          <div className={classes.master}>
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
              className={classes.masterMeter}
            />
          </div>

          <div className={classes.lip} aria-hidden="true">
            <Screw size={9} turn={20} />
            <span className={classes.nameplate}>
              One <b>Small</b> Studio
            </span>
            <Screw size={9} turn={-35} />
          </div>
        </div>

        <span className={classes.cheek} data-side="right" aria-hidden="true" />
      </div>
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

/** The tilted display: what's loaded, what's playing, and the tracklist. */
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
