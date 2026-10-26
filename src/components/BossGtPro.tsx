import { useId } from 'react';
import classes from './BossGtPro.module.css';

/*
 * The Boss GT-Pro in the guitar rack, a full 2U, drawn from Josh's photos in the photo's pixel
 * space: the grey brushed panel with input and output at the left, the silver preamp/speaker
 * panel with the display and the PATCH/VALUE dial, the black key blocks on silver at the right,
 * and the logo, power rocker and COSM badge at the far right.
 */

/** Silver-capped knobs with black knurled skirts: x, y, skirt radius, pointer angle. */
type KnobSpec = [number, number, number, number];

const LEFT_KNOBS: KnobSpec[] = [
  [794, 989, 66, -80],
  [804, 1267, 66, -95],
  [959, 1257, 66, -10],
];
const PREAMP_X = [1497, 1644, 1786, 1933, 2078, 2222];
const PREAMP_LABELS = ['GAIN', 'BASS', 'MIDDLE', 'TREBLE', 'PRESENCE', 'LEVEL'];
const PREAMP_ANGLES = [160, -100, 10, 120, 160, 60];
const TYPE_LEFT = ['BG LEAD', 'COMBO', 'CRUNCH', 'TW CLEAN', 'JC CLEAN'];
const TYPE_RIGHT = ['R-FIER', 'T-AMP', 'Hi GAIN', 'METAL', 'CUSTOM'];
const TYPE_ROWS = [1139, 1166, 1193, 1219, 1245];
const PREAMP_KEYS = [1290, 1502, 1733, 1849, 2009, 2222];

const EFFECT_X = [2477, 2610, 2742, 2874, 3008, 3140, 3272];
const EFFECTS = [
  ['COMP', 'OD/DS', 'WAH', 'EQ', 'DELAY', 'CHORUS', 'REVERB'],
  ['FX-1', 'FX-2', 'AMP CTL1', 'AMP CTL2', 'PRE LOOP', 'LOOP 1/2', 'ASSIGN'],
];
const EDIT_X = [2480, 2600, 2718, 2838];

function Knob({
  x,
  y,
  r,
  angle,
  ids,
}: {
  x: number;
  y: number;
  r: number;
  angle: number;
  ids: Ids;
}) {
  const ticks = Array.from({ length: 21 }, (_, i) => -150 + i * 15);
  return (
    <g transform={`translate(${x} ${y})`}>
      {ticks.map((deg) => (
        <line
          key={deg}
          y1={-r - 3}
          y2={-r - 13}
          transform={`rotate(${deg})`}
          className={classes.tick}
        />
      ))}
      <circle r={r} cy="4" className={classes.knobShadow} />
      <circle r={r} className={classes.skirt} />
      <circle r={r - 4} className={classes.knurl} />
      <circle r={r * 0.6} fill={`url(#${ids.cap})`} />
      <line
        y1={-r * 0.15}
        y2={-r * 0.58}
        transform={`rotate(${angle})`}
        className={classes.index}
      />
    </g>
  );
}

function Key({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 41} y={y - 25} width="82" height="50" rx="9" className={classes.key} />
      <rect x={x - 12} y={y - 2} width="24" height="5" rx="2.5" className={classes.keyLamp} />
    </g>
  );
}

function Screw({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" className={classes.screw} />
      <circle cx={x} cy={y} r="6" className={classes.screwHead} />
    </g>
  );
}

type Ids = { cap: string; body: string; silver: string; brush: string };

export function BossGtPro() {
  const id = useId();
  const ids: Ids = {
    cap: `${id}cap`,
    body: `${id}body`,
    silver: `${id}silver`,
    brush: `${id}brush`,
  };

  return (
    <svg className={classes.gt} viewBox="420 812 3320 626" role="img" aria-label="Boss GT-Pro">
      <defs>
        <radialGradient id={ids.cap} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fbfbfc" />
          <stop offset="0.55" stopColor="#c9cbcf" />
          <stop offset="1" stopColor="#8c8f95" />
        </radialGradient>
        <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a5c61" />
          <stop offset="0.6" stopColor="#64676d" />
          <stop offset="1" stopColor="#575a5f" />
        </linearGradient>
        <linearGradient id={ids.silver} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6d8db" />
          <stop offset="1" stopColor="#b5b8bd" />
        </linearGradient>
        {/* Brushed metal: faint horizontal grain over the paint. */}
        <pattern id={ids.brush} width="40" height="6" patternUnits="userSpaceOnUse">
          <rect width="40" height="1.5" fill="rgb(255 255 255 / 0.05)" />
          <rect y="3" width="40" height="1" fill="rgb(0 0 0 / 0.06)" />
        </pattern>
      </defs>

      {/* The grey brushed panel, wider than the drawing so it meets the rack ears. */}
      <rect x="0" y="700" width="4200" height="850" fill={`url(#${ids.body})`} />
      <rect x="0" y="700" width="4200" height="850" fill={`url(#${ids.brush})`} />

      {/* Input and output, at the left. */}
      <rect x="557" y="858" width="471" height="23" className={classes.bar} />
      <text x="792" y="876" className={classes.barText}>
        INPUT
      </text>
      <text x="807" y="906" className={classes.white}>
        LEVEL
      </text>
      <circle cx="631" cy="979" r="44" className={classes.blueNut} />
      <circle cx="631" cy="979" r="22" className={classes.hole} />
      <text x="958" y="991" className={classes.white}>
        PEAK
      </text>
      <circle cx="958" cy="1020" r="5" className={classes.peak} />
      <rect x="573" y="1134" width="467" height="25" className={classes.bar} />
      <text x="808" y="1153" className={classes.barText}>
        OUTPUT
      </text>
      <text x="647" y="1182" className={classes.white}>
        PHONES
      </text>
      <text x="820" y="1182" className={classes.white}>
        MAIN
      </text>
      <text x="965" y="1182" className={classes.white}>
        SUB
      </text>
      <circle cx="641" cy="1262" r="44" className={classes.chromeNut} />
      <circle cx="641" cy="1262" r="22" className={classes.hole} />
      {LEFT_KNOBS.map(([x, y, r, a]) => (
        <Knob key={x} x={x} y={y} r={r} angle={a} ids={ids} />
      ))}

      {/* The silver preamp/speaker panel. */}
      <rect x="1056" y="823" width="1334" height="570" rx="4" fill={`url(#${ids.silver})`} />
      <rect x="1056" y="823" width="1334" height="570" rx="4" fill={`url(#${ids.brush})`} />
      <rect x="1056" y="823" width="1334" height="570" rx="4" className={classes.silverEdge} />
      <Screw x={1090} y={868} />
      <Screw x={2348} y={868} />
      <Screw x={1108} y={1362} />
      <Screw x={2342} y={1362} />

      <rect x="1140" y="868" width="922" height="194" rx="3" className={classes.display} />
      <text x="1297" y="895" className={classes.white}>
        BANK
      </text>
      <text x="1305" y="1002" className={classes.digits}>
        88
      </text>
      <rect x="1523" y="915" width="447" height="95" rx="3" className={classes.lcd} />
      <text x="1530" y="958" className={classes.lcdText}>
        P01 HiGAIN STACK
      </text>
      <text x="1530" y="996" className={classes.lcdText}>
        MS STACK · DELAY
      </text>

      <text x="2108" y="876" className={classes.darkStart}>
        PATCH/
      </text>
      <text x="2108" y="898" className={classes.darkStart}>
        VALUE
      </text>
      <circle cx="2222" cy="972" r="89" className={classes.knobShadow} />
      <circle cx="2222" cy="968" r="89" className={classes.skirt} />
      <circle cx="2222" cy="968" r="82" className={classes.knurl} />
      <circle cx="2222" cy="968" r="62" className={classes.dial} />

      <rect x="1148" y="1073" width="1152" height="24" className={classes.bar} />
      <text x="1725" y="1092" className={classes.barText}>
        PREAMP/SPEAKER
      </text>
      <text x="1160" y="1116" className={classes.darkStart}>
        TYPE
      </text>
      <text x="1287" y="1116" className={classes.dark}>
        MS STACK
      </text>
      {TYPE_ROWS.map((y, i) => (
        <g key={y}>
          <text x="1150" y={y + 6} className={classes.darkStart}>
            {TYPE_LEFT[i]}
          </text>
          <text x="1355" y={y + 6} className={classes.darkStart}>
            {TYPE_RIGHT[i]}
          </text>
        </g>
      ))}
      <rect x="1350" y="1235" width="72" height="20" className={classes.customBox} />
      <Knob x={1271} y={1199} r={52} angle={-120} ids={ids} />
      {PREAMP_X.map((x, i) => (
        <g key={x}>
          <text x={x} y="1116" className={classes.dark}>
            {PREAMP_LABELS[i]}
          </text>
          <Knob x={x} y={1199} r={54} angle={PREAMP_ANGLES[i]} ids={ids} />
        </g>
      ))}
      <text x="1565" y="1265" className={classes.darkSmall}>
        TURBO
      </text>

      <text x="1500" y="1290" className={classes.dark}>
        TYPE VARIATION
      </text>
      <rect x="1694" y="1275" width="194" height="21" className={classes.bar} />
      <text x="1791" y="1292" className={classes.barText}>
        A-CHANNEL-B
      </text>
      <rect x="1957" y="1275" width="102" height="92" className={classes.soloBox} />
      <rect x="1957" y="1275" width="102" height="21" className={classes.bar} />
      <text x="2008" y="1292" className={classes.barText}>
        SOLO
      </text>
      <text x="2222" y="1290" className={classes.dark}>
        SPEAKER
      </text>
      {PREAMP_KEYS.map((x) => (
        <Key key={x} x={x} y={1332} />
      ))}

      {/* Edit keys, on their own black block. */}
      <rect x="2408" y="837" width="500" height="275" rx="5" className={classes.block} />
      <text x="2540" y="872" className={classes.white}>
        PARAMETER
      </text>
      <text x="2480" y="893" className={classes.white}>
        ◄
      </text>
      <text x="2600" y="893" className={classes.white}>
        ►
      </text>
      <text x="2718" y="868" className={classes.white}>
        OUTPUT
      </text>
      <text x="2718" y="889" className={classes.white}>
        SELECT
      </text>
      <text x="2838" y="889" className={classes.white}>
        SYSTEM
      </text>
      <path d="M2480 956 V966 H2512 M2568 966 H2600 V956" className={classes.jump} />
      <text x="2540" y="972" className={classes.white}>
        JUMP
      </text>
      <text x="2718" y="976" className={classes.white}>
        INS
      </text>
      <text x="2838" y="976" className={classes.white}>
        DEL
      </text>
      <text x="2480" y="1021" className={classes.white}>
        EXIT
      </text>
      <text x="2598" y="1021" className={classes.white}>
        WRITE
      </text>
      <text x="2717" y="1021" className={classes.white}>
        SHIFT
      </text>
      <text x="2838" y="1002" className={classes.white}>
        TUNER/
      </text>
      <text x="2838" y="1022" className={classes.white}>
        BYPASS
      </text>
      <text x="2717" y="1105" className={classes.white}>
        CAPS
      </text>
      {EDIT_X.map((x) => (
        <g key={x}>
          <Key x={x} y={925} />
          <Key x={x} y={1058} />
        </g>
      ))}

      {/* NAME/FX CHAIN, MASTER and PATCH LEVEL, black boxes on a silver plate. */}
      <rect x="2940" y="837" width="418" height="275" rx="3" fill={`url(#${ids.silver})`} />
      <rect x="2958" y="848" width="117" height="120" className={classes.block} />
      <text x="3016" y="868" className={classes.white}>
        NAME/
      </text>
      <text x="3016" y="888" className={classes.white}>
        FX CHAIN
      </text>
      <Key x={3016} y={925} />
      <rect x="2956" y="1000" width="116" height="100" className={classes.block} />
      <text x="3014" y="1021" className={classes.white}>
        MASTER
      </text>
      <Key x={3014} y={1058} />
      <rect x="3126" y="848" width="182" height="254" className={classes.block} />
      <text x="3217" y="868" className={classes.white}>
        PATCH
      </text>
      <text x="3217" y="888" className={classes.white}>
        LEVEL
      </text>
      <Knob x={3240} y={990} r={54} angle={115} ids={ids} />

      {/* Two rows of effect keys, black strips on a silver plate. */}
      <rect x="2405" y="1130" width="940" height="255" rx="3" fill={`url(#${ids.silver})`} />
      <rect x="2420" y="1140" width="910" height="102" rx="3" className={classes.block} />
      <rect x="2420" y="1272" width="910" height="100" rx="3" className={classes.block} />
      {EFFECTS.map((row, r) =>
        row.map((label, i) => (
          <g key={label}>
            <text x={EFFECT_X[i]} y={r ? 1297 : 1166} className={classes.white}>
              {label}
            </text>
            <Key x={EFFECT_X[i]} y={r ? 1330 : 1200} />
          </g>
        )),
      )}

      {/* Logo, power rocker and the COSM badge. */}
      <rect x="3380" y="840" width="40" height="40" rx="3" className={classes.logoBox} />
      <path d="M3392 848 V872 H3410 V860 H3398" className={classes.logoMark} />
      <text x="3540" y="879" className={classes.boss}>
        BOSS
      </text>
      <text x="3513" y="968" className={classes.model}>
        GT-PRO
      </text>
      <text x="3510" y="1000" className={classes.tagline}>
        GUITAR EFFECTS PROCESSOR
      </text>
      <text x="3505" y="1082" className={classes.white}>
        POWER
      </text>
      <rect x="3412" y="1095" width="200" height="218" rx="6" className={classes.bezel} />
      <rect x="3455" y="1132" width="114" height="146" rx="4" className={classes.rocker} />
      <rect x="3460" y="1138" width="104" height="80" rx="3" className={classes.rockerFace} />
      <rect x="3420" y="1335" width="155" height="27" rx="3" className={classes.cosm} />
      <text x="3497" y="1356" className={classes.cosmText}>
        COSM
      </text>
    </svg>
  );
}
