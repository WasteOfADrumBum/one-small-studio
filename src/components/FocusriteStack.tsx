import { useId } from 'react';
import classes from './FocusriteStack.module.css';

/*
 * The Focusrite pair as it sits in the rack: a Scarlett 18i20 (3rd gen) above an OctoPre MkII,
 * each laid out from photos of the real front panel and drawn in that photo's pixel space. The
 * meters show a quiet ready state, not levels.
 */

const SCARLETT_GAINS = [557, 638, 718, 799, 879, 959, 1040, 1120];
const SCARLETT_METER_X = [1188, 1210, 1231, 1253, 1274, 1296, 1318, 1340];
const SCARLETT_METER_Y = [640, 654, 668, 682, 696];
/** Buttons under the gain knobs, with the label lit above each one. */
const SCARLETT_BUTTONS: [number, string, string][] = [
  [536, 'INST', '#ff3b3b'],
  [578, 'PAD', '#3bff6a'],
  [617, 'INST', '#ff3b3b'],
  [659, 'PAD', '#3bff6a'],
  ...SCARLETT_GAINS.slice(2).map((x): [number, string, string] => [x, 'PAD', '#3bff6a']),
];

function Dial({
  x,
  y,
  r,
  angle,
  fill,
  className,
}: {
  x: number;
  y: number;
  r: number;
  angle: number;
  fill: string;
  className?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`} className={className}>
      <circle r={r} fill={fill} className={classes.dial} />
      <line y1={-r * 0.2} y2={-r * 0.85} transform={`rotate(${angle})`} className={classes.index} />
    </g>
  );
}

/** Scale dots around a knob, seven o'clock to five o'clock. */
function Scale({ x, y, r, className }: { x: number; y: number; r: number; className: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 11 }, (_, i) => (
        <circle
          key={i}
          r="1.6"
          cy={-r}
          transform={`rotate(${-140 + i * 28})`}
          className={className}
        />
      ))}
    </g>
  );
}

function Combo({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} className={classes.comboRing} />
      <circle r={r * 0.78} className={classes.comboFace} />
      <circle r={r * 0.24} className={classes.comboHole} />
      {[-90, 30, 150].map((a) => (
        <circle
          key={a}
          r={r * 0.09}
          cx={Math.cos((a * Math.PI) / 180) * r * 0.5}
          cy={Math.sin((a * Math.PI) / 180) * r * 0.5}
          className={classes.comboHole}
        />
      ))}
    </g>
  );
}

function Scarlett({ cap }: { cap: string }) {
  return (
    <svg
      className={classes.unit}
      viewBox="208 591 1548 158"
      role="img"
      aria-label="Focusrite Scarlett 18i20"
    >
      <rect x="212" y="595" width="1540" height="150" rx="6" className={classes.scarlettEdge} />
      <rect x="219" y="600" width="1526" height="140" rx="3" className={classes.scarlettFace} />

      <text x="358" y="618" className={classes.s}>
        INPUTS
      </text>
      <text x="308" y="620" className={classes.s}>
        1
      </text>
      <text x="410" y="620" className={classes.s}>
        2
      </text>
      <Combo x={309} y={670} r={37} />
      <Combo x={410} y={670} r={37} />
      <text x="226" y="731" className={classes.scarlettLogo}>
        Scarlett
      </text>
      <rect x="284" y="718" width="44" height="16" rx="2" className={classes.modelBox} />
      <text x="306" y="731" className={classes.modelText}>
        18i20
      </text>

      <text x="489" y="618" className={classes.s}>
        48V
      </text>
      <text x="489" y="640" className={classes.s} fill="#ff3b3b">
        1-4
      </text>
      <circle cx="489" cy="658" r="8" className={classes.button} />
      <text x="489" y="696" className={classes.s} fill="#ff3b3b">
        5-8
      </text>
      <circle cx="489" cy="713" r="8" className={classes.button} />

      {SCARLETT_GAINS.map((x, i) => (
        <g key={x}>
          <line x1={x - 40} x2={x - 40} y1="608" y2="700" className={classes.rule} />
          <text x={x - 25} y="618" className={classes.s}>
            {i + 1}
          </text>
          <Scale x={x} y={638} r={27} className={classes.scaleDot} />
          <Dial
            x={x}
            y={638}
            r={19}
            angle={[-20, 10, -40, 0, 30, -10, 20, -30][i]}
            fill={`url(#${cap})`}
          />
          <text x={x - 19} y="671" className={classes.xs}>
            0
          </text>
          <text x={x + 18} y="671" className={classes.xs}>
            10
          </text>
          <text x={x} y="680" className={classes.s} fill="#ffb03b">
            AIR
          </text>
        </g>
      ))}
      {SCARLETT_BUTTONS.map(([x, label, color]) => (
        <g key={x}>
          <text x={x} y="696" className={classes.s} fill={color}>
            {label}
          </text>
          <circle cx={x} cy="713" r="8" className={classes.button} />
        </g>
      ))}

      {/* Input meter: only the bottom segment of each channel lit, ready and waiting. */}
      <text x="1263" y="618" className={classes.s}>
        INPUTS
      </text>
      {['dB', '0', '-3', '-6', '-18', '-42'].map((t, i) => (
        <text key={t} x="1169" y={[630, 644, 658, 672, 686, 700][i]} className={classes.xs}>
          {t}
        </text>
      ))}
      {SCARLETT_METER_X.map((x, c) => (
        <g key={x}>
          <text x={x} y="630" className={classes.xs}>
            {c + 1}
          </text>
          {SCARLETT_METER_Y.map((y, r) => (
            <rect
              key={y}
              x={x - 8}
              y={y - 3}
              width="16"
              height="6"
              rx="1"
              className={classes.seg}
              data-lit={r === 4 || undefined}
            />
          ))}
        </g>
      ))}
      <text x="1264" y="716" className={classes.s} fill="#3bff6a">
        MIDI
      </text>
      <rect x="1183" y="708" width="10" height="8" rx="1" className={classes.green} />
      <path d="M1328 712 h22 m-6 -4 l6 4 l-6 4" className={classes.usb} />

      <text x="1385" y="618" className={classes.s}>
        MONITOR
      </text>
      <text x="1385" y="639" className={classes.s} fill="#3bff6a">
        TALKBACK
      </text>
      <circle cx="1385" cy="657" r="8" className={classes.button} />
      <Scale x={1451} y={638} r={28} className={classes.scaleDot} />
      <Dial x={1451} y={638} r={20} angle={-30} fill={`url(#${cap})`} />
      {[
        [1385, 'ALT', '#3bff6a'],
        [1427, 'DIM', '#ffb03b'],
        [1469, 'MUTE', '#ff3b3b'],
      ].map(([x, label, color]) => (
        <g key={label}>
          <text x={x} y="696" className={classes.s} fill={String(color)}>
            {label}
          </text>
          <circle cx={x} cy="713" r="8" className={classes.button} />
        </g>
      ))}

      {[1539, 1621].map((x, i) => (
        <g key={x}>
          <line x1={x - 45} x2={x - 45} y1="608" y2="720" className={classes.rule} />
          <text x={x - 28} y="618" className={classes.s}>
            {i + 1}
          </text>
          <Scale x={x} y={638} r={27} className={classes.scaleDot} />
          <Dial x={x} y={638} r={19} angle={i ? 20 : -15} fill={`url(#${cap})`} />
          <circle cx={x - 4} cy="697" r="14" className={classes.jack} />
        </g>
      ))}
      <path d="M1571 701 v-4 a5 5 0 0 1 10 0 v4" className={classes.usb} />

      <text x="1697" y="630" className={classes.s}>
        POWER
      </text>
      <rect x="1675" y="640" width="46" height="66" rx="3" className={classes.rocker} />
      <rect x="1681" y="646" width="34" height="27" rx="2" className={classes.rockerFace} />
      <text x="1698" y="732" className={classes.focusriteLogo}>
        Focusrite
      </text>
    </svg>
  );
}

/** OctoPre gain knobs, with blue scale rings. */
const OCTO_GAINS = [243, 294, 352, 398, 444, 490, 536, 582];
const OCTO_METER_X = Array.from({ length: 8 }, (_, i) => 641 + i * 11);

function OctoPre({ cap }: { cap: string }) {
  return (
    <svg
      className={classes.unit}
      viewBox="4 204 990 98"
      role="img"
      aria-label="Focusrite OctoPre MkII"
    >
      <rect x="8" y="208" width="982" height="90" rx="3" className={classes.octoFace} />

      <circle cx="42" cy="243" r="11" className={classes.badgeDisc} />
      <text x="42" y="247" className={classes.badgeMark}>
        ff
      </text>
      <text x="42" y="266" className={classes.octoLogo}>
        Focusrite
      </text>

      <rect x="74" y="212" width="122" height="82" rx="3" className={classes.box} />
      <text x="135" y="221" className={classes.o}>
        Mic-Line-Inst INPUT
      </text>
      <Combo x={113} y={253} r={19} />
      <Combo x={160} y={253} r={19} />
      <text x="113" y="287" className={classes.o}>
        1
      </text>
      <text x="160" y="287" className={classes.o}>
        2
      </text>

      <text x="209" y="219" className={classes.o}>
        MIC
      </text>
      <text x="209" y="225" className={classes.o}>
        48V
      </text>
      <rect x="203" y="230" width="12" height="11" rx="1" className={classes.key} />
      <circle cx="209" cy="249" r="2.6" className={classes.redOff} />
      <text x="209" y="259" className={classes.o}>
        1-4
      </text>
      <rect x="203" y="264" width="12" height="11" rx="1" className={classes.key} />
      <circle cx="209" cy="283" r="2.6" className={classes.redOff} />
      <text x="209" y="293" className={classes.o}>
        5-8
      </text>

      {OCTO_GAINS.map((x, i) => (
        <g key={x}>
          <rect x={x - 21} y="212" width="42" height="49" rx="4" className={classes.box} />
          <rect x={x - 20} y="213" width="7" height="7" rx="1" className={classes.chip} />
          <Scale x={x} y={236} r={14} className={classes.blueDot} />
          <circle cx={x} cy={236} r="12.5" className={classes.blueRing} />
          <Dial
            x={x}
            y={236}
            r={9.5}
            angle={[-30, 20, -50, 10, 40, -10, 30, -20][i]}
            fill={`url(#${cap})`}
          />
          <text x={x} y="257" className={classes.o}>
            GAIN
          </text>
        </g>
      ))}
      {[
        [234, 'Inst'],
        [256, 'Pad'],
        [285, 'Inst'],
        [307, 'Pad'],
        ...OCTO_GAINS.slice(2).map((x) => [x, 'Pad']),
      ].map(([x, label]) => (
        <g key={x}>
          <rect x={Number(x) - 6} y="265" width="12" height="11" rx="1" className={classes.key} />
          <circle cx={x} cy="284" r="2.6" className={classes.redOff} />
          <text x={x} y="294" className={classes.o}>
            {label}
          </text>
        </g>
      ))}

      {/* Input meter window, the bottom segment of each bar lit. */}
      <rect x="612" y="221" width="120" height="60" rx="3" className={classes.meterWindow} />
      {['0', '-6', '-18', '-42'].map((t, i) => (
        <text key={t} x="624" y={[238, 247, 256, 265][i]} className={classes.o}>
          {t}
        </text>
      ))}
      {OCTO_METER_X.map((x, c) => (
        <g key={x}>
          <text x={x} y="230" className={classes.o}>
            {c + 1}
          </text>
          {Array.from({ length: 8 }, (_, s) => (
            <rect
              key={s}
              x={x - 2}
              y={234 + s * 4}
              width="4"
              height="3"
              className={classes.seg}
              data-lit={s === 7 || undefined}
            />
          ))}
        </g>
      ))}
      <text x="672" y="276" className={classes.o}>
        INPUTS
      </text>

      {/* Sample rate and clock source. */}
      <rect x="742" y="212" width="134" height="82" rx="3" className={classes.box} />
      {['96', '88.2', '48', '44.1'].map((t, i) => (
        <g key={t}>
          <circle
            cx="772"
            cy={219 + i * 12}
            r="2.8"
            className={t === '48' ? classes.green : classes.greenOff}
          />
          <text x="780" y={221 + i * 12} className={classes.o} style={{ textAnchor: 'start' }}>
            {t}
          </text>
        </g>
      ))}
      {[
        ['Internal', classes.red],
        ['Wordclock', classes.redOff],
        ['Locked', classes.green],
      ].map(([t, c], i) => (
        <g key={t}>
          <circle cx="835" cy={219 + i * 12} r="2.8" className={c} />
          <text x="843" y={221 + i * 12} className={classes.o} style={{ textAnchor: 'start' }}>
            {t}
          </text>
        </g>
      ))}
      <rect x="766" y="265" width="12" height="11" rx="1" className={classes.key} />
      <text x="772" y="288" className={classes.o}>
        Sample Rate
      </text>
      <rect x="829" y="265" width="12" height="11" rx="1" className={classes.key} />
      <text x="835" y="288" className={classes.o}>
        Clock Source
      </text>

      <rect x="882" y="212" width="80" height="82" rx="3" className={classes.box} />
      <circle cx="897" cy="222" r="3" className={classes.green} />
      <text x="905" y="224" className={classes.o} style={{ textAnchor: 'start' }}>
        Power
      </text>
      <rect x="889" y="235" width="28" height="40" rx="2" className={classes.rocker} />
      <rect x="893" y="239" width="20" height="16" rx="1" className={classes.rockerFace} />
      <rect x="924" y="233" width="33" height="30" rx="2" className={classes.octoBadge} />
      <text x="940" y="246" className={classes.octoBadgeText}>
        OctoPre
      </text>
      <text x="940" y="256" className={classes.octoBadgeText}>
        MkII
      </text>
    </svg>
  );
}

export function FocusriteStack() {
  const cap = `${useId()}cap`;
  return (
    <div className={classes.stack}>
      <svg width="0" height="0" className={classes.defs} aria-hidden="true">
        <defs>
          <radialGradient id={cap} cx="40%" cy="32%" r="75%">
            <stop offset="0" stopColor="#5a5c62" />
            <stop offset="0.5" stopColor="#25262a" />
            <stop offset="1" stopColor="#0c0c0e" />
          </radialGradient>
        </defs>
      </svg>
      <Scarlett cap={cap} />
      <OctoPre cap={cap} />
    </div>
  );
}
