import { useId } from 'react';
import classes from './CarvinBX1600.module.css';

/*
 * A Carvin BX1600 bass amp, 2U at the bottom of the amps rack, drawn from photos of its front and
 * in the product photo's pixel space: a black chassis with two red faceplates lit from lamps
 * along their top and bottom edges. The preamp is on the left and the graphic EQ, master, power
 * amp controls and power rocker are on the right. The small keys glow blue, except the effects
 * loop, which glows yellow-green.
 */

/** Knobs: x, y, pointer angle. */
const KNOBS: [number, number, number][] = [
  [200, 124, -60],
  [250, 124, 20],
  [297, 124, -20],
  [347, 124, 0],
  [398, 124, -10],
  [450, 124, 10],
  [500, 124, 0],
  [297, 192, -140],
  [347, 192, -60],
  [398, 192, -100],
  [450, 192, -20],
  [870, 122, 40],
  [793, 192, -30],
  [845, 192, 0],
  [895, 192, 20],
];
const TOP_LABELS: [string, number][] = [
  ['DRIVE', 200],
  ['CONTOUR', 250],
  ['BASS', 297],
  ['LO MID', 347],
  ['MID', 398],
  ['HI MID', 450],
  ['TREBLE', 500],
];
const FREQS: [string, number][] = [
  ['250', 347],
  ['900', 398],
  ['3.5K', 450],
];
const BANDS = ['50', '80', '125', '250', '500', '800', '1.2K', '2.5K', '5K'];
/** Graphic EQ slider positions, 0 at the top (+12) to 1 at the bottom (-12). */
const SLIDERS = [0.35, 0.4, 0.5, 0.55, 0.6, 0.55, 0.45, 0.4, 0.35];
/** Lamps along the panels' bottom edges. */
const LAMPS = [233, 341, 435, 591, 705, 855];
/** Blue key lamps: x, y. */
const BLUE: [number, number][] = [
  [205, 166],
  [240, 166],
  [518, 162],
  [813, 103],
];

/** Lamp colours: the faceplate lamps, the key lamps and the effects loop lamp. */
const GLOW = { red: '#ff2a2a', blue: '#4d8dff', green: '#c8ff3a' };

function Knob({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 11 }, (_, i) => -150 + i * 30).map((deg) => (
        <circle key={deg} cy="-21" r="0.9" transform={`rotate(${deg})`} className={classes.dot} />
      ))}
      <circle r="15" cy="1.5" className={classes.knobShadow} />
      <circle r="14" className={classes.knob} />
      <line y1="-2" y2="-13" transform={`rotate(${angle})`} className={classes.pointer} />
    </g>
  );
}

function Key({ x, y }: { x: number; y: number }) {
  return <rect x={x - 6} y={y - 6} width="12" height="12" rx="1.5" className={classes.key} />;
}

export function CarvinBX1600() {
  const id = useId();
  const red = `${id}red`;
  const glow = `${id}glow`;

  return (
    <svg
      className={classes.bx}
      viewBox="75 55 960 180"
      role="img"
      aria-label="Carvin BX1600 bass amp"
    >
      <defs>
        {/* Lit from the top and bottom edges, darkest across the middle. */}
        <linearGradient id={red} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e5303a" />
          <stop offset="0.18" stopColor="#b8141e" />
          <stop offset="0.5" stopColor="#8e0d15" />
          <stop offset="0.82" stopColor="#b8141e" />
          <stop offset="1" stopColor="#ef3a40" />
        </linearGradient>
        {Object.entries(GLOW).map(([name, color]) => (
          <radialGradient key={name} id={`${glow}${name}`}>
            <stop offset="0" stopColor={color} stopOpacity="0.9" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      <rect x="0" y="0" width="1200" height="300" className={classes.chassis} />
      {[
        [100, 72],
        [100, 220],
        [1012, 72],
        [1012, 220],
        [544, 64],
        [544, 228],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="5.5" className={classes.screw} />
          <path d={`M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}`} className={classes.slot} />
        </g>
      ))}

      {/* The two red faceplates. */}
      <rect
        x="122"
        y="76"
        width="418"
        height="148"
        rx="4"
        fill={`url(#${red})`}
        className={classes.panel}
      />
      <rect
        x="548"
        y="76"
        width="449"
        height="148"
        rx="4"
        fill={`url(#${red})`}
        className={classes.panel}
      />
      {LAMPS.map((x) => (
        <g key={x} className={classes.lamp}>
          <circle cx={x} cy="221" r="14" fill={`url(#${glow}red)`} />
          <circle cx={x} cy="221" r="2.2" />
        </g>
      ))}

      {/* Preamp. */}
      <g className={classes.jewel}>
        <circle cx="145" cy="126" r="22" fill={`url(#${glow}blue)`} />
        <circle cx="145" cy="126" r="13" className={classes.jewelRim} />
        <circle cx="145" cy="126" r="9" className={classes.jewelLens} />
      </g>
      <text x="150" y="164" className={classes.label}>
        INPUT
      </text>
      <circle cx="150" cy="190" r="12" className={classes.jackNut} />
      <circle cx="150" cy="190" r="6" className={classes.hole} />

      {TOP_LABELS.map(([label, x]) => (
        <text key={label} x={x} y="92" className={classes.label}>
          {label}
        </text>
      ))}
      <path d="M323 98 V84 H475 V98 M373 84 V98 M424 84 V98" className={classes.rule} />
      {[297, 347, 398, 450, 500].map((x) => (
        <text key={x} x={x} y="101" className={classes.small}>
          -0+
        </text>
      ))}
      <text x="232" y="143" className={classes.small}>
        FLAT
      </text>
      <text x="270" y="143" className={classes.small}>
        SCOOP
      </text>
      {FREQS.map(([hz, x]) => (
        <g key={hz}>
          <text x={x} y="148" className={classes.small}>
            LEVEL
          </text>
          <text x={x} y="161" className={classes.label}>
            FREQ
          </text>
          <text x={x} y="170" className={classes.small}>
            {hz}
          </text>
        </g>
      ))}
      <text x="297" y="168" className={classes.label}>
        COMP
      </text>
      <text x="282" y="214" className={classes.small}>
        OFF
      </text>
      <text x="314" y="214" className={classes.small}>
        MAX
      </text>
      <text x="205" y="180" className={classes.small}>
        MUTE
      </text>
      <text x="240" y="180" className={classes.small}>
        ACTIVE
      </text>
      <text x="518" y="175" className={classes.small}>
        GRAPHIC EQ
      </text>
      <Key x={205} y={192} />
      <Key x={240} y={192} />
      <Key x={518} y={190} />

      {/* Graphic EQ. */}
      <text x="652" y="98" className={classes.model}>
        BX1600
      </text>
      <text x="652" y="111" className={classes.label}>
        DUAL MONO BASS AMPLIFIER
      </text>
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1="552"
          x2="750"
          y1={120 + i * 7.8}
          y2={120 + i * 7.8}
          className={classes.grid}
        />
      ))}
      <text x="759" y="124" className={classes.small}>
        +12
      </text>
      <text x="759" y="201" className={classes.small}>
        -12
      </text>
      {BANDS.map((band, i) => {
        const x = 559 + i * 23.5;
        const y = 120 + SLIDERS[i] * 78;
        return (
          <g key={band}>
            <rect x={x - 2} y="117" width="4" height="84" rx="2" className={classes.track} />
            <rect x={x - 6} y={y - 4} width="12" height="8" rx="1" className={classes.cap} />
            <line x1={x - 5} x2={x + 5} y1={y} y2={y} className={classes.capLine} />
            <text x={x} y="214" className={classes.small}>
              {band}
            </text>
          </g>
        );
      })}

      {/* Loop, crossover, master and power amp controls. */}
      <text x="775" y="112" className={classes.small}>
        EFFECTS
      </text>
      <text x="775" y="119" className={classes.small}>
        LOOP
      </text>
      <text x="813" y="117" className={classes.small}>
        X-OVER
      </text>
      <Key x={775} y={130} />
      <Key x={813} y={130} />
      <g className={classes.loop}>
        <circle cx="775" cy="102" r="9" fill={`url(#${glow}green)`} />
        <circle cx="775" cy="102" r="2.4" />
      </g>
      {BLUE.map(([x, y]) => (
        <g key={`${x}-${y}`} className={classes.blue}>
          <circle cx={x} cy={y} r="10" fill={`url(#${glow}blue)`} />
          <circle cx={x} cy={y} r="2.4" />
        </g>
      ))}
      <text x="870" y="94" className={classes.label}>
        MASTER
      </text>
      <text x="793" y="157" className={classes.label}>
        CROSSOVER
      </text>
      <text x="793" y="166" className={classes.label}>
        FREQ
      </text>
      <text x="793" y="174" className={classes.small}>
        800Hz
      </text>
      <text x="770" y="214" className={classes.small}>
        100Hz
      </text>
      <text x="816" y="214" className={classes.small}>
        2kHz
      </text>
      <text x="870" y="157" className={classes.label}>
        POWER AMP CONTROL
      </text>
      <text x="845" y="167" className={classes.label}>
        1 LO
      </text>
      <text x="895" y="167" className={classes.label}>
        2 HI
      </text>
      <text x="870" y="176" className={classes.small}>
        PEAK
      </text>
      {KNOBS.map(([x, y, a]) => (
        <Knob key={`${x}-${y}`} x={x} y={y} angle={a} />
      ))}

      <text x="948" y="102" className={classes.carvin}>
        CARVIN
      </text>
      <rect x="926" y="115" width="48" height="52" rx="3" className={classes.bezel} />
      <rect x="932" y="121" width="36" height="40" rx="2" className={classes.rocker} />
      <line x1="950" y1="127" x2="950" y2="137" className={classes.rockerMark} />
      <circle cx="950" cy="149" r="4" className={classes.rockerRing} />
      <rect x="928" y="182" width="40" height="24" rx="3" className={classes.tube} />
      <text x="948" y="192" className={classes.tubeText}>
        12AX7
      </text>
      <text x="948" y="201" className={classes.tubeText}>
        TUBE
      </text>
    </svg>
  );
}
