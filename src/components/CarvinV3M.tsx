import { useId } from 'react';
import classes from './CarvinV3M.module.css';

/*
 * The Carvin V3M as it sits in the guitar rack, 4U in all, laid out from photos. The head is drawn
 * straight on from photos of the amp: the grey vented shell with its V3 cutout and the tubes
 * glowing through, and the black front panel with channels 3, 2 and 1 left to right. In the rack
 * it sits back on two black brackets, so the slotted 2U grid panel in front covers the shell and
 * only the panel shows below it. The head is in its own photo's pixel space, the rack in the rack
 * photo's.
 */

/** Knob centre x and pointer angle (degrees from twelve o'clock), top row then bottom row. */
const TOP: [number, number][] = [
  [292, -40],
  [398, -20],
  [505, 40],
  [610, 30],
  [717, 0],
  [825, -45],
  [932, 20],
  [1038, -30],
  [1145, 0],
  [1252, -10],
];
const BOTTOM: [number, number][] = [
  [292, -60],
  [400, 150],
  [505, 60],
  [612, -20],
  [718, -25],
  [825, -60],
  [932, -75],
  [1038, -150],
  [1145, 5],
  [1250, 40],
];
const TOP_LABELS = ['MASTER', 'PRESENCE', 'VOLUME', 'DRIVE'];
const BOTTOM_LABELS = ['REVERB', 'BASS', 'MID', 'TREBLE'];
const ROW_TOP = 912;
const ROW_BOTTOM = 1018;

/** Tube-glow strength behind each vent slot, left bank then right bank. */
const SLOTS_LEFT = [0.7, 0.85, 0.95, 1, 0.95, 0.85, 0.7];
const SLOTS_RIGHT = [0.75, 0.9, 1, 1, 1, 0.9, 0.75];

/** The drive and boost LEDs: x, y, colour. Green boost, then channels 3, 2 and 1. */
const LEDS: [number, number, string][] = [
  [334, 866, '#5dff7a'],
  [652, 864, '#ffc23a'],
  [965, 862, '#ff2a2a'],
  [1286, 860, '#3a8bff'],
];

const SCALE = Array.from({ length: 11 }, (_, i) => -150 + i * 30);

function Knob({ x, y, angle, cap }: { x: number; y: number; angle: number; cap: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {SCALE.map((deg, n) => {
        const r = (deg * Math.PI) / 180;
        return (
          <text key={deg} x={Math.sin(r) * 37} y={-Math.cos(r) * 37 + 4} className={classes.digit}>
            {n}
          </text>
        );
      })}
      <circle r="30" cy="3" className={classes.knobShadow} />
      <circle r="28" fill={`url(#${cap})`} className={classes.knurl} />
      <line y1="-4" y2="-25" transform={`rotate(${angle})`} className={classes.pointer} />
    </g>
  );
}

function Toggle({ x, y, up = true }: { x: number; y: number; up?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="11" className={classes.nut} />
      <rect x="-3.5" y={up ? -20 : 0} width="7" height="20" rx="3" className={classes.lever} />
    </g>
  );
}

/** A labelled bracket over one channel's three top-row controls. */
function Channel({ n, from, to }: { n: number; from: number; to: number }) {
  const mid = (from + to) / 2;
  return (
    <g>
      <path
        d={`M${from} 852 V843 H${mid - 18} M${mid + 18} 843 H${to} V852`}
        className={classes.bracket}
      />
      <text x={mid} y="852" className={classes.channel}>
        {n}
      </text>
    </g>
  );
}

function Head() {
  const id = useId();
  const shell = `${id}shell`;
  const panel = `${id}panel`;
  const cap = `${id}cap`;
  const tube = `${id}tube`;
  const halo = `${id}halo`;

  return (
    <g className={classes.amp}>
      <defs>
        <linearGradient id={shell} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9ebee" />
          <stop offset="0.08" stopColor="#d7d9dc" />
          <stop offset="0.85" stopColor="#c3c5c9" />
          <stop offset="1" stopColor="#9fa2a7" />
        </linearGradient>
        <linearGradient id={panel} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1d20" />
          <stop offset="1" stopColor="#0d0d0f" />
        </linearGradient>
        <radialGradient id={cap} cx="40%" cy="32%" r="75%">
          <stop offset="0" stopColor="#4c4c52" />
          <stop offset="0.5" stopColor="#1e1e22" />
          <stop offset="1" stopColor="#0a0a0c" />
        </radialGradient>
        {/* Valve light rising from the bottom of each slot. */}
        <linearGradient id={tube} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd0d0" />
          <stop offset="0.25" stopColor="#ff2a2a" />
          <stop offset="0.75" stopColor="#e00018" stopOpacity="0.8" />
          <stop offset="1" stopColor="#c00010" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={halo}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rubber feet. */}
      <rect x="230" y="1074" width="80" height="18" rx="4" className={classes.foot} />
      <rect x="1300" y="1074" width="80" height="18" rx="4" className={classes.foot} />

      {/* The vented shell. */}
      <rect x="130" y="522" width="1350" height="298" rx="10" fill={`url(#${shell})`} />
      <rect x="130" y="522" width="1350" height="298" rx="10" className={classes.shellEdge} />
      <g>
        {[
          ...SLOTS_LEFT.map((g, i) => [207 + i * 70, g]),
          ...SLOTS_RIGHT.map((g, i) => [997 + i * 70, g]),
        ].map(([x, glow], i) => (
          <g key={x}>
            <rect x={x - 11} y="612" width="22" height="134" rx="11" className={classes.slot} />
            <rect
              x={x - 11}
              y="612"
              width="22"
              height="134"
              rx="11"
              fill={`url(#${tube})`}
              opacity={glow}
              className={classes.tube}
              style={{ animationDelay: `${(i % 5) * -1.1}s` }}
            />
          </g>
        ))}
        {/* The V3 badge, cut through the shell. */}
        <path
          d="M712 616 L780 640 L806 728 L834 640 L862 640 L820 772 L770 772 Z"
          className={classes.slot}
        />
        <path
          d="M712 616 L780 640 L806 728 L834 640 L862 640 L820 772 L770 772 Z"
          fill={`url(#${tube})`}
          opacity="0.95"
          className={classes.tube}
        />
        <text x="914" y="772" className={classes.badge}>
          3
        </text>
      </g>

      {/* The front panel. */}
      <rect x="140" y="818" width="1334" height="262" rx="4" fill={`url(#${panel})`} />
      <rect x="140" y="818" width="1334" height="262" rx="4" className={classes.panelEdge} />

      {/* Power and standby rockers. */}
      <text x="200" y="866" className={classes.label}>
        POWER
      </text>
      <rect x="176" y="878" width="48" height="70" rx="4" className={classes.rocker} />
      <rect x="183" y="884" width="34" height="30" rx="2" className={classes.rockerFace} />
      <text x="200" y="976" className={classes.label}>
        RUN
      </text>
      <rect x="176" y="986" width="48" height="66" rx="4" className={classes.rocker} />
      <rect x="183" y="992" width="34" height="28" rx="2" className={classes.rockerFace} />
      <text x="200" y="1070" className={classes.label}>
        STANDBY
      </text>

      <Channel n={3} from={364} to={646} />
      <Channel n={2} from={684} to={966} />
      <Channel n={1} from={1004} to={1286} />

      {TOP.map(([x], i) => (
        <text key={x} x={x} y="868" className={classes.label}>
          {i === 0 ? TOP_LABELS[0] : TOP_LABELS[((i - 1) % 3) + 1]}
        </text>
      ))}
      {BOTTOM.map(([x], i) => (
        <text key={x} x={x} y="976" className={classes.label}>
          {i === 0 ? BOTTOM_LABELS[0] : BOTTOM_LABELS[((i - 1) % 3) + 1]}
        </text>
      ))}
      <text x="338" y="847" className={classes.small}>
        BOOST
      </text>
      {[
        [558, 'BRIGHT', 'SOAK'],
        [880, 'INTENSE', 'THICK'],
        [1198, 'INTENSE', 'THICK'],
      ].map(([x, over, under]) => (
        <g key={x}>
          <text x={Number(x) + 4} y="857" className={classes.small}>
            {over}
          </text>
          <text x={x} y="926" className={classes.small}>
            {under}
          </text>
          <Toggle x={Number(x)} y={892} />
        </g>
      ))}
      {[452, 770, 1092].map((x) => (
        <g key={x}>
          <text x={x} y="970" className={classes.small}>
            EQX
          </text>
          <Toggle x={x} y={1002} up={x !== 770} />
        </g>
      ))}

      {TOP.map(([x, a]) => (
        <Knob key={x} x={x} y={ROW_TOP} angle={a} cap={cap} />
      ))}
      {BOTTOM.map(([x, a]) => (
        <Knob key={x} x={x} y={ROW_BOTTOM} angle={a} cap={cap} />
      ))}

      {/* Drive LEDs, each with a soft halo. */}
      {LEDS.map(([x, y, color]) => (
        <g key={x} className={classes.led} style={{ color }}>
          <circle cx={x} cy={y} r="26" fill={`url(#${halo})`} />
          <circle cx={x} cy={y} r="7" fill={color} className={classes.ledLens} />
        </g>
      ))}

      {/* Channel select and footswitch, the logo, and the input jack. */}
      <text x="1380" y="846" className={classes.small}>
        ▲ UP FOR FOOTSWITCH ▲
      </text>
      <text x="1345" y="866" className={classes.small}>
        CH 3
      </text>
      <text x="1414" y="866" className={classes.small}>
        CH 2
      </text>
      <Toggle x={1345} y={894} />
      <Toggle x={1414} y={894} />
      <path d="M1385 878 V912 M1385 905 H1396" className={classes.bracket} />
      <text x="1345" y="920" className={classes.small}>
        SELECT
      </text>
      <text x="1414" y="920" className={classes.small}>
        CH 1
      </text>
      <text x="1380" y="968" className={classes.logo}>
        CARVIN
      </text>
      <circle cx="1378" cy="1000" r="20" className={classes.jackNut} />
      <circle cx="1378" cy="1000" r="8" className={classes.jackHole} />
      <text x="1380" y="1062" className={classes.model}>
        V3M
      </text>
    </g>
  );
}

/** Grid panel slots: six columns of five, as x and y of each slot's top left. */
const GRID_X = [140, 362, 586, 810, 1035, 1260];
const GRID_Y = [64, 103, 144, 185, 226];

export function CarvinV3M() {
  const id = useId();
  const holes = `${id}holes`;
  const carpet = `${id}carpet`;

  return (
    <svg
      className={classes.rack}
      viewBox="40 20 1540 575"
      role="img"
      aria-label="Carvin V3M amp head, set back in the rack under a slotted grid panel"
    >
      <defs>
        <mask id={holes}>
          <rect x="-400" y="-400" width="2420" height="688" fill="#fff" />
          {GRID_X.map((x) =>
            GRID_Y.map((y) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="205" height="19" rx="9.5" />
            )),
          )}
        </mask>
        <linearGradient id={carpet} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141416" />
          <stop offset="0.3" stopColor="#2a2a2d" />
          <stop offset="1" stopColor="#323236" />
        </linearGradient>
      </defs>

      {/* The rack's carpeted floor and the shadow at the back. */}
      <rect x="-400" y="-400" width="2420" height="1400" className={classes.recess} />
      <rect x="-400" y="470" width="2420" height="530" fill={`url(#${carpet})`} />

      {/* The head, scaled from its own photo to sit between the brackets. */}
      <g transform="translate(-37 -566.9) scale(1.05)">
        <Head />
      </g>

      {/* Behind the grid the shell is in shadow, lit red by the valves. */}
      <rect x="-400" y="-400" width="2420" height="688" className={classes.shade} />
      <ellipse cx="810" cy="160" rx="760" ry="170" className={classes.valveLight} />

      {/* The two black brackets the head rests on. */}
      <rect x="38" y="288" width="68" height="290" rx="8" className={classes.bracketBlock} />
      <rect x="1514" y="288" width="68" height="290" rx="8" className={classes.bracketBlock} />

      {/* The slotted grid panel in front, the shell and its valves showing through the slots. */}
      <rect
        x="-400"
        y="-400"
        width="2420"
        height="688"
        mask={`url(#${holes})`}
        className={classes.gridPanel}
      />
      <line x1="-400" y1="287" x2="2020" y2="287" className={classes.gridEdge} />
    </svg>
  );
}
