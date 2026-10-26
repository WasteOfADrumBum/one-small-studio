import { useId } from 'react';
import classes from './BossGtPro.module.css';

/*
 * A Boss GT-Pro, the 2U rack guitar processor, laid out from a photo of its front panel and drawn
 * in that photo's pixel space: input and output at the left, the silver preamp/speaker panel with
 * its display, the patch dial and edit keys, two rows of effect keys and the power rocker.
 */

/** Preamp/speaker knobs under the display: x and pointer angle. */
const PREAMP: [string, number, number][] = [
  ['GAIN', 201, 40],
  ['BASS', 229, -10],
  ['MIDDLE', 256, 20],
  ['TREBLE', 282, 0],
  ['PRESENCE', 309, -30],
  ['LEVEL', 337, 10],
];
const PREAMP_KEYS: [string, number][] = [
  ['TYPE VARIATION', 210],
  ['A-CHANNEL-B', 262],
  ['SOLO', 300],
  ['SPEAKER', 337],
];
const EFFECTS = [
  ['COMP', 'OD/DS', 'WAH', 'EQ', 'DELAY', 'CHORUS', 'REVERB'],
  ['FX-1', 'FX-2', 'AMP CTL1', 'AMP CTL2', 'PRE LOOP', 'LOOP1/2', 'ASSIGN'],
];
const EFFECT_X = [372, 397, 422, 447, 472, 497, 522];
/** Which effect keys are lit, as in a patch that is playing. */
const LIT = new Set(['COMP', 'OD/DS', 'DELAY', 'REVERB', 'FX-1']);
const EDIT_KEYS: [string, number, number][] = [
  ['', 383, 54],
  ['', 400, 54],
  ['', 420, 54],
  ['', 441, 54],
  ['EXIT', 383, 78],
  ['WRITE', 400, 78],
  ['', 420, 78],
  ['SHIFT', 441, 78],
  ['', 467, 54],
  ['MASTER', 467, 78],
];

function Knob({
  x,
  y,
  r,
  angle,
  cap,
}: {
  x: number;
  y: number;
  r: number;
  angle: number;
  cap: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 1.5} className={classes.skirt} />
      <circle r={r} fill={`url(#${cap})`} />
      <line y1={-r * 0.25} y2={-r * 0.9} transform={`rotate(${angle})`} className={classes.index} />
    </g>
  );
}

function Jack({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7.5" className={classes.jackNut} />
      <circle cx={x} cy={y} r="3.6" className={classes.hole} />
    </g>
  );
}

export function BossGtPro() {
  const id = useId();
  const cap = `${id}cap`;
  const silver = `${id}silver`;
  const face = `${id}face`;

  return (
    <svg className={classes.gt} viewBox="22 4 556 124" role="img" aria-label="Boss GT-Pro">
      <defs>
        <radialGradient id={cap} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#6a6c72" />
          <stop offset="0.5" stopColor="#2a2b2f" />
          <stop offset="1" stopColor="#0e0e10" />
        </radialGradient>
        <linearGradient id={silver} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d2d5da" />
          <stop offset="1" stopColor="#a7abb1" />
        </linearGradient>
        <linearGradient id={face} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3b40" />
          <stop offset="1" stopColor="#26272b" />
        </linearGradient>
      </defs>

      <rect x="22" y="4" width="556" height="124" fill={`url(#${face})`} />
      <line x1="22" y1="6" x2="578" y2="6" className={classes.edge} />

      {/* Input and output. */}
      <rect x="44" y="34" width="84" height="40" rx="2" className={classes.well} />
      <text x="88" y="31" className={classes.t}>
        INPUT
      </text>
      <Jack x={60} y={56} />
      <text x="97" y="43" className={classes.t}>
        LEVEL
      </text>
      <Knob x={97} y={57} r={8} angle={20} cap={cap} />
      <circle cx="118" cy="57" r="2" className={classes.peak} />
      <text x="118" y="51" className={classes.t}>
        PEAK
      </text>
      <rect x="44" y="84" width="84" height="38" rx="2" className={classes.well} />
      <text x="88" y="81" className={classes.t}>
        OUTPUT
      </text>
      <text x="60" y="93" className={classes.t}>
        PHONES
      </text>
      <Jack x={60} y={106} />
      <Knob x={88} y={106} r={8} angle={-20} cap={cap} />
      <Knob x={113} y={106} r={8} angle={10} cap={cap} />

      {/* Preamp/speaker panel with the display. */}
      <rect x="132" y="24" width="206" height="104" rx="2" fill={`url(#${silver})`} />
      <text x="162" y="32" className={classes.dark}>
        BANK
      </text>
      <rect x="148" y="36" width="188" height="44" rx="1" className={classes.lcd} />
      <text x="166" y="66" className={classes.digit}>
        1
      </text>
      <text x="256" y="57" className={classes.lcdText}>
        HiGAIN STACK
      </text>
      <text x="292" y="72" className={classes.lcdText}>
        B 1-1
      </text>
      <text x="236" y="88" className={classes.dark}>
        PREAMP / SPEAKER
      </text>
      <text x="141" y="96" className={classes.dark}>
        TYPE
      </text>
      <Knob x={160} y={106} r={8} angle={-60} cap={cap} />
      {PREAMP.map(([label, x, a]) => (
        <g key={label}>
          <text x={x} y="96" className={classes.dark}>
            {label}
          </text>
          <Knob x={x} y={106} r={8} angle={a} cap={cap} />
        </g>
      ))}
      {PREAMP_KEYS.map(([label, x]) => (
        <g key={label}>
          <rect x={x - 8} y="117" width="16" height="6" rx="1" className={classes.key} />
          <text x={x} y="127" className={classes.dark}>
            {label}
          </text>
        </g>
      ))}

      {/* Patch dial, edit keys and patch level. */}
      <text x="356" y="40" className={classes.t}>
        PATCH/VALUE
      </text>
      <Knob x={356} y={58} r={13} angle={-30} cap={cap} />
      <text x="392" y="40" className={classes.t}>
        PARAMETER
      </text>
      <text x="420" y="46" className={classes.t}>
        OUTPUT
      </text>
      <text x="441" y="40" className={classes.t}>
        SYSTEM
      </text>
      <text x="467" y="40" className={classes.t}>
        NAME/FX CHAIN
      </text>
      {EDIT_KEYS.map(([label, x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 8} y={y - 5} width="16" height="10" rx="1.5" className={classes.key} />
          {label && (
            <text x={x} y={y + 13} className={classes.t}>
              {label}
            </text>
          )}
        </g>
      ))}
      <text x="506" y="40" className={classes.t}>
        PATCH LEVEL
      </text>
      <Knob x={506} y={58} r={11} angle={0} cap={cap} />

      {/* Two rows of effect keys, each with its lamp. */}
      {EFFECTS.map((row, r) =>
        row.map((label, i) => (
          <g key={label}>
            <text x={EFFECT_X[i]} y={r ? 115 : 95} className={classes.t}>
              {label}
            </text>
            <rect
              x={EFFECT_X[i] - 9}
              y={r ? 118 : 98}
              width="18"
              height="3"
              rx="1"
              className={classes.fxLed}
              data-lit={LIT.has(label) || undefined}
            />
            <rect
              x={EFFECT_X[i] - 10}
              y={r ? 122 : 102}
              width="20"
              height="5"
              rx="1"
              className={classes.key}
            />
          </g>
        )),
      )}

      {/* Logo, power and the COSM badge. */}
      <text x="528" y="20" className={classes.boss}>
        BOSS
      </text>
      <text x="548" y="43" className={classes.model}>
        GT-PRO
      </text>
      <text x="548" y="52" className={classes.t}>
        GUITAR EFFECTS PROCESSOR
      </text>
      <text x="560" y="78" className={classes.t}>
        POWER
      </text>
      <rect x="551" y="83" width="18" height="24" rx="2" className={classes.rocker} />
      <rect x="553" y="85" width="14" height="10" rx="1" className={classes.rockerFace} />
      <rect x="548" y="113" width="26" height="10" rx="1" className={classes.cosm} />
      <text x="561" y="121" className={classes.cosmText}>
        COSM
      </text>
    </svg>
  );
}
