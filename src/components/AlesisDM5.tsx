import { useId } from 'react';
import classes from './AlesisDM5.module.css';

/*
 * An Alesis DM5 drum module, the 1U unit in the recording rack, drawn from photos of its front
 * panel and in that photo's pixel space: the logo, PHONES and VOLUME at the left, the green
 * backlit display, the VALUE wheel and PREVIEW pad, the white edit keys and the POWER button.
 */

/** White keys: label lines, x and y. */
const KEYS: [string[], number, number][] = [
  [['STORE'], 759, 370],
  [['NOTE', 'CHASE'], 805, 370],
  [['VOICE'], 866, 370],
  [['TUNE'], 912, 370],
  [['MIX'], 958, 370],
  [['OUTPUT'], 1005, 370],
  [['◄'], 759, 407],
  [['►'], 805, 407],
  [['DRUM', 'SET'], 866, 407],
  [['EXT', 'TRIG'], 912, 407],
  [['GROUP'], 958, 407],
  [['MIDI'], 1005, 407],
];

export function AlesisDM5() {
  const id = useId();
  const face = `${id}face`;
  const lcd = `${id}lcd`;
  const wheel = `${id}wheel`;

  return (
    <svg className={classes.dm5} viewBox="105 338 1002 100" role="img" aria-label="Alesis DM5">
      <defs>
        <linearGradient id={face} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3b42" />
          <stop offset="1" stopColor="#25262b" />
        </linearGradient>
        <linearGradient id={lcd} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b6f0a6" />
          <stop offset="1" stopColor="#86d77a" />
        </linearGradient>
        <radialGradient id={wheel} cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#060607" />
        </radialGradient>
      </defs>

      <rect x="0" y="300" width="1300" height="200" fill={`url(#${face})`} />
      {Array.from({ length: 24 }, (_, i) => (
        <line
          key={i}
          x1="0"
          x2="1300"
          y1={340 + i * 4}
          y2={340 + i * 4}
          className={classes.grain}
        />
      ))}

      {/* Logo, phones and volume. */}
      <text x="117" y="358" className={classes.alesis}>
        ALESIS
      </text>
      <text x="131" y="377" className={classes.dm5Logo}>
        DM5
      </text>
      <circle cx="155" cy="390" r="12" className={classes.jackNut} />
      <circle cx="155" cy="390" r="6" className={classes.hole} />
      <text x="157" y="428" className={classes.label}>
        PHONES
      </text>
      <circle cx="212" cy="388" r="11" className={classes.knob} />
      <line x1="212" y1="386" x2="206" y2="379" className={classes.pointer} />
      <text x="215" y="428" className={classes.label}>
        VOLUME
      </text>

      {/* The backlit display. */}
      <rect x="255" y="345" width="258" height="83" rx="3" className={classes.bezel} />
      <text x="345" y="356" className={classes.header}>
        HIGH SAMPLE RATE 18 BIT DRUM MODULE
      </text>
      <rect
        x="262"
        y="360"
        width="243"
        height="56"
        rx="2"
        fill={`url(#${lcd})`}
        className={classes.lcd}
      />
      <g className={classes.lcdInk}>
        <text x="303" y="403" className={classes.big}>
          17
        </text>
        <text x="345" y="379" className={classes.lcdText}>
          Kik/002 Pwr Rock
        </text>
        <text x="370" y="395" className={classes.lcdText}>
          46b, 1
        </text>
        <text x="345" y="406" className={classes.lcdSmall}>
          TRIGGER 1 2 3 4 5 6 7 8 9 10 11 12
        </text>
        <text x="345" y="413" className={classes.lcdSmall}>
          TRIG LEVEL
        </text>
        <rect x="377" y="410" width="68" height="3" />
      </g>

      {/* VALUE wheel and PREVIEW pad. */}
      <text x="549" y="352" className={classes.label}>
        VALUE
      </text>
      <circle cx="581" cy="388" r="40" fill={`url(#${wheel})`} className={classes.wheel} />
      <circle cx="583" cy="370" r="7" className={classes.dimple} />
      <text x="680" y="352" className={classes.label}>
        PREVIEW
      </text>
      <rect x="652" y="368" width="55" height="40" rx="3" className={classes.pad} />

      {/* Edit keys. */}
      {KEYS.map(([lines, x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 19} y={y - 13} width="38" height="26" rx="5" className={classes.key} />
          {lines.map((line, i) => (
            <text
              key={line}
              x={x}
              y={y + (lines.length === 1 ? 3.5 : i * 8 - 1)}
              className={line === 'VOICE' ? classes.keyGreen : classes.keyText}
            >
              {line}
            </text>
          ))}
        </g>
      ))}
      <path d="M763 424 V428 H775 M793 428 H805 V424" className={classes.bracket} />
      <text x="784" y="430" className={classes.tiny}>
        PARAMETER
      </text>

      {/* Power. */}
      <text x="1069" y="352" className={classes.label}>
        POWER
      </text>
      <circle cx="1069" cy="369" r="13" className={classes.power} />
      <rect x="1048" y="399" width="41" height="14" className={classes.badge} />
      <text x="1068" y="405" className={classes.badgeText}>
        3 BUS FOR
      </text>
      <text x="1068" y="411" className={classes.badgeText}>
        18 BIT DAC
      </text>
    </svg>
  );
}
