import { useId } from 'react';
import classes from './BehringerRX1202FX.module.css';

/*
 * A Behringer Eurorack Pro RX1202FX, the 3U rack mixer in the recording rack, drawn from a photo
 * of its front panel and in that photo's pixel space, ears included: ten channel strips (silver
 * EQ columns with blue EQ, red MON and FX sends, black GAIN and PAN, a CLIP lamp and a fader),
 * then the FX section with its display, preset list, meters and MAIN MIX fader.
 */

const STRIPS = [130, 266, 401, 537, 672, 808, 943, 1079, 1214, 1358];
const NAMES = ['1', '2', '3', '4', '5', '6', '7', '8', '9/10', '11/12'];
/** Fader cap centres, as the photo has them. */
const FADERS = [1092, 1025, 940, 930, 960, 1015, 1070, 1105, 1090, 1025];
/** Knob rows: label, y, colour. */
const ROWS: [string, number, 'black' | 'blue' | 'red'][] = [
  ['GAIN', 772, 'black'],
  ['HIGH', 850, 'blue'],
  ['LOW', 927, 'blue'],
  ['MON', 1000, 'red'],
  ['FX', 1080, 'red'],
  ['PAN', 1158, 'black'],
];
const SCALE: [string, number][] = [
  ['10', 916],
  ['0', 968],
  ['10', 1020],
  ['15', 1045],
  ['20', 1070],
  ['30', 1110],
  ['60', 1145],
];
const PRESETS = [
  'HALL 00-09',
  'ROOM 10-19',
  'PLATE 20-29',
  'GATED/REV 30-39',
  'EARLY REF 40-49',
  'DELAY 50-59',
  'CHORUS 60-69',
  'PHASE/PITCH 70-79',
  'MULTI 80-99',
];
/** Meter rows: label, y, lamp colour, lit. */
const METER: [string, number, string, boolean][] = [
  ['CLIP', 803, '#ff3030', false],
  ['6', 823, '#ffd52a', false],
  ['0', 843, '#3ddc4a', true],
  ['20', 863, '#3ddc4a', true],
];

function Knob({ x, y, color, angle }: { x: number; y: number; color: string; angle: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 11 }, (_, i) => -140 + i * 28).map((deg) => (
        <line key={deg} y1="-25" y2="-29" transform={`rotate(${deg})`} className={classes.tick} />
      ))}
      <circle r="22" className={classes.skirt} />
      <circle r="17" className={classes[color]} />
      <line y1="-4" y2="-17" transform={`rotate(${angle})`} className={classes.pointer} />
    </g>
  );
}

export function BehringerRX1202FX() {
  const id = useId();
  const silver = `${id}silver`;

  return (
    <svg
      className={classes.mixer}
      viewBox="0 703 1932 527"
      role="img"
      aria-label="Behringer Eurorack Pro RX1202FX mixer"
    >
      <defs>
        <linearGradient id={silver} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4e6e9" />
          <stop offset="1" stopColor="#c3c6cb" />
        </linearGradient>
      </defs>

      {/* Silver front panel and ears. */}
      <rect x="0" y="703" width="1932" height="527" fill={`url(#${silver})`} />
      <line x1="108" y1="703" x2="108" y2="1230" className={classes.seam} />
      <line x1="1825" y1="703" x2="1825" y2="1230" className={classes.seam} />
      {[
        [35, 852],
        [35, 1077],
        [1897, 852],
        [1897, 1077],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 18}
          y={y - 11}
          width="36"
          height="22"
          rx="11"
          className={classes.slot}
        />
      ))}
      <text x="8" y="922" className={classes.earTitle}>
        EURORACK
      </text>
      <text x="8" y="939" className={classes.earTitle}>
        PRO
      </text>
      {[
        'PREMIUM 12-INPUT',
        'MIC/LINE RACK MIXER',
        'WITH XENYX MIC',
        'PREAMPLIFIERS',
        "BRITISH EQ'S AND",
        'MULTI-FX PROCESSOR',
        'MODEL RX1202FX',
      ].map((line, i) => (
        <text key={line} x="8" y={954 + i * 11.5} className={classes.earText}>
          {line}
        </text>
      ))}
      <path d="M1882 962 L1902 992 H1862 Z" className={classes.logoMark} />
      <text x="1882" y="1000" className={classes.logo}>
        behringer
      </text>

      {/* Channel strips. */}
      {STRIPS.map((x, n) => (
        <g key={x}>
          <rect x={x} y="707" width="130" height="518" rx="3" className={classes.strip} />
          <rect x={x + 3} y="710" width="124" height="20" className={classes.header} />
          <text x={x + 65} y="726" className={classes.number}>
            {NAMES[n]}
          </text>
          <rect x={x + 5} y="735" width="63" height="462" className={classes.column} />
          {ROWS.map(([label, y, color], r) => (
            <g key={label}>
              {label === 'FX' ? (
                <>
                  <rect
                    x={x + 7}
                    y={y - 46}
                    width="20"
                    height="14"
                    rx="2"
                    className={classes.fxBox}
                  />
                  <text x={x + 17} y={y - 35} className={classes.fxText}>
                    FX
                  </text>
                </>
              ) : (
                <text x={x + 8} y={y - 32} className={classes.label}>
                  {label === 'PAN' && n >= 8 ? 'BAL' : label}
                </text>
              )}
              <Knob x={x + 37} y={y} color={color} angle={[-30, 20, -10, 60, 40, 0][(r + n) % 6]} />
            </g>
          ))}
          <text x={x + 100} y="760" className={classes.white}>
            CLIP
          </text>
          <circle cx={x + 100} cy="776" r="4.5" className={classes.clip} />
          <circle cx={x + 100} cy="805" r="6" className={classes.screw} />
          <circle cx={x + 100} cy="1203" r="6" className={classes.screw} />
          {SCALE.map(([v, y]) => (
            <text key={y} x={x + 79} y={y + 4} className={classes.scale}>
              {v}
            </text>
          ))}
          <rect x={x + 97} y="900" width="8" height="245" rx="3" className={classes.track} />
          <rect
            x={x + 81}
            y={FADERS[n] - 37}
            width="40"
            height="74"
            rx="7"
            className={classes.cap}
          />
          <line
            x1={x + 84}
            x2={x + 118}
            y1={FADERS[n]}
            y2={FADERS[n]}
            className={classes.capLine}
          />
          <rect x={x + 5} y="1201" width="120" height="20" className={classes.footer} />
          <text x={x + 65} y="1216" className={classes.footerText}>
            {n >= 8 ? 'LINE' : 'MIC/LINE'}
          </text>
        </g>
      ))}

      {/* The FX and master section. */}
      <rect x="1500" y="707" width="305" height="518" rx="3" className={classes.strip} />
      <text x="1653" y="722" className={classes.title}>
        EURORACK PRO RX1202FX
      </text>
      <text x="1653" y="734" className={classes.subtitle}>
        PREMIUM 12-INPUT MIC/LINE RACK MIXER WITH XENYX MIC
      </text>
      <text x="1653" y="745" className={classes.subtitle}>
        PREAMPLIFIERS • BRITISH EQ&apos;S AND MULTI-FX PROCESSOR
      </text>

      <rect x="1505" y="750" width="120" height="215" rx="3" className={classes.black} />
      <rect x="1515" y="757" width="62" height="38" className={classes.display} />
      <text x="1546" y="789" className={classes.digits}>
        8.3
      </text>
      <text x="1601" y="779" className={classes.white}>
        CLIP
      </text>
      <text x="1601" y="799" className={classes.white}>
        SIG
      </text>
      <rect x="1590" y="762" width="22" height="4" className={classes.ledOff} />
      <rect x="1590" y="782" width="22" height="4" className={classes.sig} />
      <text x="1553" y="830" className={classes.fxLogo}>
        FX
      </text>
      <Knob x={1550} y={858} color="black" angle={-40} />
      <text x="1603" y="850" className={classes.white}>
        PROGRAM
      </text>
      <text x="1603" y="862" className={classes.white}>
        (PUSH)
      </text>
      <Knob x={1545} y={928} color="white" angle={-90} />
      <text x="1603" y="925" className={classes.white}>
        FX TO
      </text>
      <text x="1603" y="937" className={classes.white}>
        MAIN
      </text>

      <circle cx="1640" cy="770" r="5" className={classes.power} />
      <circle cx="1680" cy="770" r="5" className={classes.phantom} />
      <text x="1645" y="787" className={classes.white}>
        POWER
      </text>
      <text x="1681" y="787" className={classes.white}>
        +48V
      </text>
      {METER.map(([label, y, color, lit]) => (
        <g key={label}>
          <circle
            cx="1640"
            cy={y}
            r="5"
            fill={color}
            className={classes.meter}
            data-lit={lit || undefined}
          />
          <circle
            cx="1680"
            cy={y}
            r="5"
            fill={color}
            className={classes.meter}
            data-lit={lit || undefined}
          />
          <text x="1660" y={y + 4} className={classes.white}>
            {label}
          </text>
        </g>
      ))}
      <text x="1640" y="890" className={classes.white}>
        L
      </text>
      <text x="1680" y="890" className={classes.white}>
        R
      </text>

      <rect x="1693" y="765" width="107" height="205" rx="2" className={classes.black} />
      <rect x="1698" y="768" width="96" height="16" className={classes.presetBox} />
      <text x="1746" y="781" className={classes.presetTitle}>
        100 PRESETS
      </text>
      {PRESETS.map((p, i) => (
        <text key={p} x="1793" y={804 + i * 19.7} className={classes.preset}>
          {p}
        </text>
      ))}

      {[
        ['CD/TAPE', 'TO MIX', 980],
        ['CD/TAPE', 'TO CTRL', 1020],
        ['FX SOLO', '', 1062],
      ].map(([a, b, y]) => (
        <g key={`${a}${b}`}>
          <rect x="1505" y={Number(y)} width="120" height="34" className={classes.black} />
          <rect
            x="1535"
            y={Number(y) + 7}
            width="38"
            height="20"
            rx="2"
            className={classes.button}
          />
          <text x="1603" y={Number(y) + (b ? 15 : 21)} className={classes.white}>
            {a}
          </text>
          {b && (
            <text x="1603" y={Number(y) + 27} className={classes.white}>
              {b}
            </text>
          )}
        </g>
      ))}
      <text x="1553" y="1111" className={classes.white}>
        PHONES/
      </text>
      <text x="1553" y="1123" className={classes.white}>
        CONTROL ROOM
      </text>
      <Knob x={1550} y={1162} color="white" angle={-70} />

      {SCALE.map(([v, y]) => (
        <text key={y} x="1638" y={y + 4} className={classes.scale}>
          {v}
        </text>
      ))}
      <rect x="1656" y="905" width="8" height="240" rx="3" className={classes.track} />
      <rect x="1640" y="978" width="40" height="74" rx="7" className={classes.mainCap} />
      <line x1="1643" x2="1677" y1="1015" y2="1015" className={classes.capLine} />

      <path
        d="M1738 1112 Q1738 1094 1750 1094 Q1762 1094 1762 1112 M1736 1108 V1118 M1764 1108 V1118"
        className={classes.phonesIcon}
      />
      <circle cx="1750" cy="1158" r="18" className={classes.jackNut} />
      <circle cx="1750" cy="1158" r="9" className={classes.hole} />

      <rect x="1505" y="1201" width="295" height="20" className={classes.footer} />
      <text x="1553" y="1216" className={classes.footerText}>
        FX/CTRL
      </text>
      <text x="1660" y="1216" className={classes.footerText}>
        MAIN MIX
      </text>
      <text x="1750" y="1216" className={classes.footerText}>
        PHONES
      </text>
    </svg>
  );
}
