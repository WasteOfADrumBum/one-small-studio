import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import classes from './ScarlettSolo.module.css';

/** Knob travel either side of twelve o'clock, as on the hardware. */
const SWEEP = 135;

type Props = {
  /** The console is on: the 48V, AIR and INST legends light. */
  powered: boolean;
  /** The player has an album ready: the USB symbol lights green and the gain halos show ready. */
  ready: boolean;
  volume: number;
  setVolume: (volume: number) => void;
};

/**
 * The phone's stand-in for the Dock: a two-in, two-out USB interface in the style of a
 * third-generation Scarlett Solo, red case and black faceplate, laid out as the real one. Only the
 * MONITOR knob does anything (it is the master volume); sockets, gain knobs, buttons and lights
 * are printed dressing, hidden from keyboard and screen readers. The gain halos can't follow the
 * music: the SoundCloud player plays in its own frame and gives the page no access to its audio,
 * so they hold a steady, dim ready glow rather than pretend to meter anything.
 */
export function ScarlettSolo({ powered, ready, volume, setVolume }: Props) {
  return (
    <div
      className={classes.solo}
      data-powered={powered || undefined}
      data-ready={ready || undefined}
    >
      <span className={classes.lid} aria-hidden="true" />
      <div className={classes.case}>
        <div className={classes.face}>
          <span className={classes.xlr} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={classes.model} aria-hidden="true">
            One Small <span>Studio</span>
          </span>

          <span className={classes.num} data-ch="1" aria-hidden="true">
            1
          </span>
          <GainKnob channel="1" angle={40} />
          <span className={classes.lit} data-pos="48v" data-light="red" aria-hidden="true">
            48V
          </span>
          <span className={classes.lit} data-pos="air" data-light="amber" aria-hidden="true">
            AIR
          </span>
          <span className={classes.button} data-pos="48v" aria-hidden="true" />
          <span className={classes.button} data-pos="air" aria-hidden="true" />

          <span className={classes.jack} data-pos="inst" aria-hidden="true" />

          <span className={classes.num} data-ch="2" aria-hidden="true">
            2
          </span>
          <GainKnob channel="2" angle={0} />
          <span className={classes.lit} data-pos="inst" data-light="red" aria-hidden="true">
            INST
          </span>
          <span className={classes.button} data-pos="inst" aria-hidden="true" />

          <span className={classes.divider} aria-hidden="true" />

          <span className={classes.monitorLabel} aria-hidden="true">
            Monitor
          </span>
          <span className={classes.usb} aria-hidden="true">
            <svg viewBox="0 0 32 16">
              <circle cx="3.5" cy="8" r="2.5" />
              <path d="M6 8h22M28 8l-4-3v6zM11 8l4-5h5M17 8l3 4h3" />
              <circle cx="21" cy="3" r="1.8" />
              <rect x="23" y="10.3" width="3.4" height="3.4" />
            </svg>
          </span>
          <MonitorKnob volume={volume} setVolume={setVolume} disabled={!ready} />

          <span className={classes.dmLabel} aria-hidden="true">
            Direct
            <br />
            Monitor
          </span>
          <span className={classes.button} data-pos="dm" aria-hidden="true" />
          <span className={classes.jack} data-pos="phones" aria-hidden="true" />
          <span className={classes.phones} aria-hidden="true">
            <svg viewBox="0 0 20 18">
              <path d="M3 12V9a7 7 0 0 1 14 0v3" />
              <rect x="2" y="11" width="3.4" height="6" rx="1.2" />
              <rect x="14.6" y="11" width="3.4" height="6" rx="1.2" />
            </svg>
          </span>
        </div>
      </div>
      <span className={classes.feet} aria-hidden="true" />
    </div>
  );
}

/** A small black gain knob in its halo ring, with the min and max ticks under it. Dressing only. */
function GainKnob({ channel, angle }: { channel: '1' | '2'; angle: number }) {
  return (
    <span className={classes.gain} data-ch={channel} aria-hidden="true">
      <span className={classes.halo} />
      <span className={classes.gainCap} style={{ rotate: `${angle}deg` }} />
      <span className={classes.gainLabel}>Gain</span>
    </span>
  );
}

/**
 * The big MONITOR knob, wired to the master volume: drag up or round to turn it up, or use the
 * arrow keys, Page Up/Down, Home and End.
 */
function MonitorKnob({
  volume,
  setVolume,
  disabled,
}: {
  volume: number;
  setVolume: (volume: number) => void;
  disabled: boolean;
}) {
  const drag = useRef<{ y: number; x: number; start: number } | null>(null);
  const angle = -SWEEP + (volume / 100) * SWEEP * 2;

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    const moves: Record<string, number> = {
      ArrowUp: volume + 5,
      ArrowRight: volume + 5,
      ArrowDown: volume - 5,
      ArrowLeft: volume - 5,
      PageUp: volume + 10,
      PageDown: volume - 10,
      Home: 0,
      End: 100,
    };
    if (disabled || !(e.key in moves)) return;
    e.preventDefault();
    setVolume(moves[e.key]);
  };

  // Up and right turn it up; a finger's travel of about two knob widths covers the whole range.
  const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, x: e.clientX, start: volume };
  };
  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    const span = e.currentTarget.getBoundingClientRect().width * 2;
    const travel = d.y - e.clientY + (e.clientX - d.x);
    setVolume(d.start + (travel / span) * 100);
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <span className={classes.monitor}>
      <span
        className={classes.monitorKnob}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Monitor volume"
        aria-disabled={disabled || undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        aria-valuetext={`${volume}%`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className={classes.grip} aria-hidden="true" />
        <span className={classes.dial} style={{ rotate: `${angle}deg` }} aria-hidden="true" />
      </span>
      <span className={classes.monitorTicks} aria-hidden="true" />
    </span>
  );
}
