import type { CSSProperties } from 'react';
import classes from './Fader.module.css';

type FaderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Visible caption under the slot, e.g. "Master". */
  caption: string;
};

const TICKS = [100, 75, 50, 25, 0];

/**
 * A long-throw fader: a native range input turned on its side, so keyboard, touch and screen
 * readers get real slider behavior. The input's own thumb is an invisible, full-width grab area the
 * height of the cap; the slim cap you see is drawn over it from the same value, so the two always
 * sit on the same line and the cap's centre stays on the slot from end to end.
 */
export function Fader({ label, value, onChange, disabled, caption }: FaderProps) {
  return (
    <div className={classes.fader}>
      <div className={classes.body} style={{ '--v': value } as CSSProperties}>
        <span className={classes.scale} aria-hidden="true">
          {TICKS.map((t) => (
            <span key={t} data-major={t % 50 === 0 || undefined} />
          ))}
        </span>
        <span className={classes.slot} aria-hidden="true" />
        <input
          type="range"
          className={classes.input}
          min={0}
          max={100}
          step={1}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={`${value} percent`}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
        <span className={classes.cap} aria-hidden="true" />
      </div>
      <span className="label">{caption}</span>
      <span className={classes.readout} aria-hidden="true">
        {value}%
      </span>
    </div>
  );
}
