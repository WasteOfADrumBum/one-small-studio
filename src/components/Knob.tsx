import classes from './Knob.module.css';

type KnobProps = {
  label: string;
  size?: number;
};

/**
 * A rotary pot. Two layers turn independently so animations never fight: the outer `[data-knob-scroll]`
 * follows the page scroll, the inner `[data-knob-cap]` sweeps when the console powers on.
 */
export function Knob({ label, size = 72 }: KnobProps) {
  const ticks = Array.from({ length: 11 }, (_, i) => -135 + i * 27);
  return (
    <div className={classes.knob} style={{ width: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        {ticks.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="4"
            x2="50"
            y2="10"
            className={classes.tick}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <g data-knob-scroll>
          <g data-knob-cap transform="rotate(-135 50 50)">
            <circle cx="50" cy="50" r="34" className={classes.skirt} />
            <circle cx="50" cy="50" r="27" className={classes.cap} />
            <line x1="50" y1="50" x2="50" y2="22" className={classes.pointer} />
          </g>
        </g>
      </svg>
      <span className="label">{label}</span>
    </div>
  );
}
