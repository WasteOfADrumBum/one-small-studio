import type { CSSProperties } from 'react';
import classes from './Furman.module.css';

type FurmanProps = {
  /** The rack this conditioner powers, for the controls' accessible names. */
  rack: string;
  power: boolean;
  onPower: (on: boolean) => void;
  /** Rack light level, 0 to 100. */
  lights: number;
  onLights: (level: number) => void;
};

/**
 * A Furman M-8Lx, the 1U power conditioner at the top of every rack, laid out from photos: logo,
 * switched outlet and the LIGHTS dimmer at the left, two pull-out lamps, the PROTECTION OK lamp and
 * the POWER-ON rocker at the right. The rocker and the dimmer are real controls for their rack.
 */
export function FurmanM8Lx({ rack, power, onPower, lights, onLights }: FurmanProps) {
  return (
    <div className={classes.panel} data-on={power || undefined}>
      <span className={classes.logo} aria-hidden="true">
        FURMAN
      </span>
      <span className={classes.outletGroup} aria-hidden="true">
        <span className={classes.tiny}>Switched outlet</span>
        <span className={classes.outlet}>
          <i />
          <i />
          <i />
        </span>
      </span>
      <label className={classes.dimmer}>
        <span className={classes.tiny} aria-hidden="true">
          Lights
        </span>
        {/* The knob turns seven o'clock to five o'clock across the range. */}
        <span
          className={classes.dimKnob}
          style={{ '--turn': `${-135 + lights * 2.7}deg` } as CSSProperties}
          aria-hidden="true"
        />
        <span className={classes.tiny} aria-hidden="true">
          Dimmer
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={lights}
          aria-label={`${rack} rack lights`}
          aria-valuetext={`${lights}%`}
          onChange={(e) => onLights(Number(e.currentTarget.value))}
        />
      </label>
      <span className={classes.lamp} data-side="left" aria-hidden="true" />
      <span className={classes.lamp} data-side="right" aria-hidden="true" />
      <span className={classes.protection} aria-hidden="true">
        <span className={classes.tiny}>
          Protection
          <br />
          OK
        </span>
        <span className={classes.okLed} />
      </span>
      <span className={classes.powerGroup}>
        <span className={classes.tiny} aria-hidden="true">
          Power-on
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={power}
          aria-label={`${rack} rack power`}
          className={classes.rocker}
          onClick={() => onPower(!power)}
        />
      </span>
      <span className={classes.model} aria-hidden="true">
        M-8Lx
      </span>
    </div>
  );
}
