import { useId } from 'react';
import classes from './Knob.module.css';

type KnobProps = {
  label?: string;
  size?: number;
  /** Starting angle in degrees from twelve o'clock; -135 is fully counter-clockwise. */
  angle?: number;
};

const SCALE = Array.from({ length: 11 }, (_, i) => -135 + i * 27);
const KNURLS = Array.from({ length: 36 }, (_, i) => i * 10);

/**
 * A rotary pot with a knurled skirt and a white index line. It is display hardware: the turning
 * group `[data-knob-cap]` is animated by the console, never by the visitor, so it stays hidden from
 * assistive tech and carries no pointer affordance.
 */
export function Knob({ label, size = 64, angle = -135 }: KnobProps) {
  const id = useId();
  return (
    <div className={classes.knob} style={{ width: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id={`${id}cap`} cx="38%" cy="30%" r="75%">
            <stop offset="0" stopColor="#4a4a52" />
            <stop offset="0.55" stopColor="#24242a" />
            <stop offset="1" stopColor="#141417" />
          </radialGradient>
          <linearGradient id={`${id}skirt`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3a42" />
            <stop offset="1" stopColor="#0d0d10" />
          </linearGradient>
        </defs>
        {SCALE.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="3"
            x2="50"
            y2={deg === -135 || deg === 135 || deg === 0 ? 10 : 8}
            className={classes.tick}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        {/* Contact shadow falls down and slightly right, like everything else on the page. */}
        <circle cx="52" cy="55" r="35" className={classes.shadow} />
        <g data-knob-cap transform={`rotate(${angle} 50 50)`}>
          <circle cx="50" cy="50" r="35" fill={`url(#${id}skirt)`} />
          {KNURLS.map((deg) => (
            <line
              key={deg}
              x1="50"
              y1="15.5"
              x2="50"
              y2="20"
              className={classes.knurl}
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="27" fill={`url(#${id}cap)`} className={classes.cap} />
          <line x1="50" y1="48" x2="50" y2="25" className={classes.pointer} />
        </g>
      </svg>
      {label && <span className="label">{label}</span>}
    </div>
  );
}
