import classes from './LiveWirePC1100.module.css';

type LiveWireProps = {
  /** The rack this conditioner powers, for the controls' accessible names. */
  rack: string;
  power: boolean;
  onPower: (on: boolean) => void;
  /** Rack light level, 0 to 100. */
  lights: number;
  onLights: (level: number) => void;
};

/** The LIGHTS rocker's three positions, top to bottom on the panel, with the light level each gives. */
const LIGHT_SETTINGS = [
  { name: 'High', level: 100 },
  { name: 'Off', level: 0 },
  { name: 'Low', level: 45 },
];
/** Range input order, dimmest first, so the arrow keys step the light up and down. */
const STEPS = [1, 2, 0];

function settingFor(lights: number) {
  if (lights === 0) return 1;
  return lights > 70 ? 0 : 2;
}

/**
 * A Live Wire PC1100, the 1U power conditioner on top of the guitar rack, laid out from photos:
 * the blue swoosh and LIGHTS rocker, the logo, two pull-out lamps, the blue AC voltage display,
 * the surge and ground lamps, the blue ON/OFF rocker, the breaker and the always-on outlet. The
 * LIGHTS rocker (high, off, low) and the ON/OFF rocker are real controls for their rack.
 */
export function LiveWirePC1100({ rack, power, onPower, lights, onLights }: LiveWireProps) {
  const setting = settingFor(lights);
  return (
    <div className={classes.panel} data-on={power || undefined}>
      <span className={classes.swoosh} aria-hidden="true" />
      <label className={classes.lights}>
        <span className={classes.tiny} aria-hidden="true">
          Lights
        </span>
        <span className={classes.positions} aria-hidden="true">
          <span>High</span>
          <span>Off</span>
          <span>Low</span>
        </span>
        <span className={classes.lightRocker} data-setting={setting} aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={STEPS.indexOf(setting)}
          aria-label={`${rack} rack lights`}
          aria-valuetext={LIGHT_SETTINGS[setting].name}
          onChange={(e) => onLights(LIGHT_SETTINGS[STEPS[Number(e.currentTarget.value)]].level)}
        />
      </label>
      <span className={classes.logo} aria-hidden="true">
        <span className={classes.badge}>Live</span>
        <span className={classes.wordmark}>
          Wire<small>Power</small>
        </span>
      </span>
      <span className={classes.lamp} data-side="left" aria-hidden="true" />
      <span className={classes.legend} aria-hidden="true">
        Power conditioning
        <br />
        distribution system
        <br />
        11 outlet · dual light
      </span>
      <span className={classes.display} aria-hidden="true">
        <span className={classes.digits}>120</span>
        <span className={classes.tiny}>AC voltage input</span>
      </span>
      <span className={classes.status} aria-hidden="true">
        <span className={classes.tiny}>
          Surge protection <i data-color="pink" />
        </span>
        <span className={classes.tiny}>
          Grounded <i data-color="green" />
        </span>
      </span>
      <span className={classes.lamp} data-side="right" aria-hidden="true" />
      <span className={classes.powerGroup}>
        <span className={classes.tiny} aria-hidden="true">
          On
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={power}
          aria-label={`${rack} rack power`}
          className={classes.rocker}
          onClick={() => onPower(!power)}
        />
        <span className={classes.tiny} aria-hidden="true">
          Off
        </span>
      </span>
      <span className={classes.breaker} aria-hidden="true" />
      <span className={classes.outlet} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={classes.model} aria-hidden="true">
        PC1100
      </span>
    </div>
  );
}
