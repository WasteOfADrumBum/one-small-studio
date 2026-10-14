import type { CSSProperties } from 'react';
import classes from './LedMeter.module.css';

type LedMeterProps = {
  /** Bouncing while true; dark when false. */
  active: boolean;
  /** Seconds per bounce; give neighbouring meters different values so they don't move in lockstep. */
  speed?: number;
  /** Multiplier on the level, 0 to 1. The master meter follows the master fader with it. */
  scale?: number;
  segments?: number;
  className?: string;
};

/**
 * A vertical LED ladder. SoundCloud plays in a cross-origin frame, so its real levels can't be read:
 * the ladder moves only while audio is actually playing, and the master ladder scales with volume.
 */
export function LedMeter({
  active,
  speed = 1.3,
  scale = 1,
  segments = 14,
  className,
}: LedMeterProps) {
  return (
    <div
      className={className ? `${classes.meter} ${className}` : classes.meter}
      data-active={active || undefined}
      style={{ '--speed': `${speed}s`, '--scale': scale, '--n': segments } as CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={classes.segment}
          data-zone={i >= segments - 2 ? 'peak' : i >= segments - 5 ? 'hot' : 'clean'}
          style={{ '--i': (i * 14) / segments } as CSSProperties}
        />
      ))}
    </div>
  );
}
