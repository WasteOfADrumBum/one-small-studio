import type { CSSProperties } from 'react';
import classes from './Hardware.module.css';

type ScrewProps = { size?: number; turn?: number; className?: string };

/** A domed panel screw. The slot angle varies so a row of them doesn't look stamped. */
export function Screw({ size = 10, turn = 30, className }: ScrewProps) {
  return (
    <span
      className={className ? `${classes.screw} ${className}` : classes.screw}
      style={{ '--size': `${size}px`, '--turn': `${turn}deg` } as CSSProperties}
      aria-hidden="true"
    />
  );
}
