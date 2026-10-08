import type { CSSProperties } from 'react';
import classes from './LedMeter.module.css';

const SEGMENTS = 14;

type LedMeterProps = {
  active: boolean;
  /** Seconds per bounce; give neighbouring meters different values so they don't move in lockstep. */
  speed?: number;
};

/**
 * A vertical LED ladder. Until audio from the player can drive it, it bounces on a loop while the
 * console is on: SoundCloud plays in a cross-origin frame, so its real levels can't be read.
 */
export function LedMeter({ active, speed = 1.3 }: LedMeterProps) {
  return (
    <div
      className={classes.meter}
      data-active={active || undefined}
      style={{ '--speed': `${speed}s` } as CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          key={i}
          className={classes.segment}
          data-zone={i >= SEGMENTS - 2 ? 'peak' : i >= SEGMENTS - 5 ? 'hot' : 'clean'}
          style={{ '--i': i } as CSSProperties}
        />
      ))}
    </div>
  );
}
