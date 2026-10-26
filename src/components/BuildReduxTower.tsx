import classes from './BuildReduxTower.module.css';

/** The Build Redux "R": a squared-off bowl with a leg kicked out like a chevron, in a 20x24 box. */
const reduxR = 'M0 0H13L20 7V12L15 17L20 24H13L8 17H6V24H0ZM6 6V11H12L13 10V7L12 6Z';

const blades = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);

type FanProps = { cx: number; cy: number; r: number; squash?: number; reverse?: boolean };

/**
 * A 120mm fan with a lit ring, seen through the glass. `squash` narrows it for the front intakes,
 * which face out of the case at an angle to the viewer.
 */
function Fan({ cx, cy, r, squash = 1, reverse = false }: FanProps) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${(squash * r) / 40} ${r / 40})`}>
      <circle r="40" fill="url(#redux-fan-well)" />
      <g className={classes.rotor} data-reverse={reverse || undefined}>
        {/* Keeps the rotor's box centred on the hub so it spins in place. */}
        <circle r="36" fill="none" />
        {blades.map((turn) => (
          <path
            key={turn}
            d="M4 -7C14 -16 26 -24 34 -16C30 -8 20 -2 9 1Z"
            fill="url(#redux-blade)"
            transform={`rotate(${turn})`}
          />
        ))}
        <circle r="10" fill="#1a0507" stroke="#3a0b10" strokeWidth="1.5" />
      </g>
      <circle className={classes.ring} r="38" fill="none" stroke="#ff2b3f" strokeWidth="3.2" />
      <circle
        r="38"
        fill="none"
        stroke="#ff2b3f"
        strokeWidth="7"
        opacity="0.35"
        filter="url(#redux-bloom)"
      />
    </g>
  );
}

/**
 * Josh's Build Redux Ultra, seen from its tempered-glass side: the 360mm radiator and three red
 * fans across the top, the rear exhaust, three front intakes, the liquid-cooler block with the R,
 * RGB memory, and the RTX 5090 with its lit badge over the PSU shroud.
 */
export function BuildReduxTower() {
  return (
    <div className={classes.tower} aria-hidden="true">
      <svg viewBox="0 0 420 480" className={classes.svg}>
        <defs>
          <radialGradient id="redux-cavity" cx="0.55" cy="0.4" r="0.75">
            <stop offset="0" stopColor="#3a0710" />
            <stop offset="0.55" stopColor="#1a0408" />
            <stop offset="1" stopColor="#0a0204" />
          </radialGradient>
          <radialGradient id="redux-fan-well" r="0.5">
            <stop offset="0.25" stopColor="#2a0609" />
            <stop offset="0.85" stopColor="#4a0a12" />
            <stop offset="1" stopColor="#120305" />
          </radialGradient>
          <linearGradient id="redux-blade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#5c0d18" />
            <stop offset="1" stopColor="#ff4256" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="redux-ram" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3cf2ff" />
            <stop offset="0.3" stopColor="#5d6bff" />
            <stop offset="0.55" stopColor="#ff3cd2" />
            <stop offset="0.8" stopColor="#ff9d3c" />
            <stop offset="1" stopColor="#7dff6a" />
          </linearGradient>
          <linearGradient id="redux-gpu" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3a3b40" />
            <stop offset="0.35" stopColor="#24252a" />
            <stop offset="1" stopColor="#121215" />
          </linearGradient>
          <linearGradient id="redux-shroud" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1b1b1f" />
            <stop offset="1" stopColor="#0b0b0d" />
          </linearGradient>
          <linearGradient id="redux-glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.02" />
            <stop offset="0.351" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
          </linearGradient>
          <filter id="redux-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Feet, then the black case. */}
        <rect x="26" y="466" width="40" height="12" rx="2" fill="#050506" />
        <rect x="354" y="466" width="40" height="12" rx="2" fill="#050506" />
        <rect x="0" y="0" width="420" height="470" rx="6" fill="#0b0b0d" stroke="#232327" />

        {/* The glass chamber, lit red from inside. */}
        <rect x="9" y="9" width="402" height="352" rx="2" fill="url(#redux-cavity)" />

        {/* Motherboard (MSI) and the rear I/O shield. */}
        <rect x="78" y="58" width="226" height="262" rx="3" fill="#0d0a0c" stroke="#24161a" />
        <path d="M92 74h60M92 82h40M250 220h40M250 228h28" stroke="#2a1a1e" strokeWidth="2" />
        <rect x="84" y="64" width="34" height="58" rx="2" fill="#7c7f86" opacity="0.55" />
        <text x="101" y="98" className={classes.msi} transform="rotate(-90 101 98)">
          MSI
        </text>

        {/* Expansion slot covers on the back wall. */}
        <g stroke="#2b2b30" strokeWidth="5">
          {[262, 278, 294, 310, 326].map((y) => (
            <path key={y} d={`M16 ${y}h44`} />
          ))}
        </g>

        {/* Top radiator and its three fans, seen edge-on from the side. */}
        <rect x="74" y="14" width="262" height="14" rx="3" fill="#141416" stroke="#2a2a2e" />
        {[118, 205, 292].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="38" rx="38" ry="9" fill="#2a060b" />
            <ellipse
              className={classes.ring}
              cx={cx}
              cy="38"
              rx="38"
              ry="9"
              fill="none"
              stroke="#ff2b3f"
              strokeWidth="3"
            />
            <ellipse
              cx={cx}
              cy="38"
              rx="38"
              ry="9"
              fill="none"
              stroke="#ff2b3f"
              strokeWidth="8"
              opacity="0.4"
              filter="url(#redux-bloom)"
            />
          </g>
        ))}

        {/* Rear exhaust. */}
        <Fan cx={50} cy={160} r={40} reverse />

        {/* RGB memory, two sticks beside the cooler. */}
        <g className={classes.ram}>
          <rect x="232" y="88" width="8" height="104" rx="1.5" fill="url(#redux-ram)" />
          <rect x="246" y="88" width="8" height="104" rx="1.5" fill="url(#redux-ram)" />
          <rect
            x="228"
            y="84"
            width="30"
            height="112"
            fill="url(#redux-ram)"
            opacity="0.35"
            filter="url(#redux-bloom)"
          />
        </g>

        {/* Liquid cooler: the pump block with the lit R, and its braided tubes to the radiator. */}
        <g fill="none" stroke="#050506" strokeWidth="8" strokeLinecap="round">
          <path d="M176 120C176 70 300 96 306 30" />
          <path d="M196 120C204 80 318 108 322 30" />
        </g>
        <g fill="none" stroke="#3a1015" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
          <path d="M173 116C173 68 297 93 303 30" />
          <path d="M193 116C201 77 315 105 319 30" />
        </g>
        <rect
          x="156"
          y="120"
          width="60"
          height="60"
          rx="7"
          fill="#0f0f12"
          stroke="#2c2c31"
          strokeWidth="2"
        />
        <rect x="163" y="127" width="46" height="46" rx="4" fill="#160509" />
        <path
          className={classes.blockLogo}
          d={reduxR}
          transform="translate(175 135) scale(1.1)"
          fill="#ff3348"
          fillRule="evenodd"
        />

        {/* Front intakes behind the corner glass. */}
        <Fan cx={364} cy={92} r={44} squash={0.8} />
        <Fan cx={364} cy={192} r={44} squash={0.8} />
        <Fan cx={364} cy={292} r={44} squash={0.8} />

        {/* RTX 5090 across the board, with its power cable dropping into the shroud. */}
        <g>
          <path d="M84 232H326L334 240V286L326 292H84Z" fill="url(#redux-gpu)" stroke="#3a3b40" />
          <path
            d="M150 238L176 262L150 286M244 238L270 262"
            fill="none"
            stroke="#141417"
            strokeWidth="6"
          />
          <g stroke="#2b2c31" strokeWidth="1.2">
            {Array.from({ length: 18 }, (_, i) => (
              <path key={i} d={`M${184 + i * 4} 244v34`} />
            ))}
          </g>
          <text x="96" y="276" className={classes.rtx}>
            GEFORCE RTX
          </text>
          <g fill="#8a8c92" opacity="0.7">
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${196 + i * 9} 278l5 -9h4l-5 9z`} />
            ))}
          </g>
          <rect x="282" y="246" width="40" height="38" rx="3" fill="#0c0d0f" />
          <g className={classes.badge}>
            <path d="M292 256h20v6l-4 4v10h-12v-10l-4 -4z" fill="#45f28a" />
            <path d="M296 262h12M302 262v12" stroke="#0c0d0f" strokeWidth="2" />
            <circle cx="287" cy="252" r="1.6" fill="#7dfdd8" />
            <circle cx="317" cy="252" r="1.6" fill="#5ad8ff" />
            <circle cx="287" cy="278" r="1.6" fill="#7dfdd8" />
            <circle cx="317" cy="278" r="1.6" fill="#5ad8ff" />
            <rect
              x="282"
              y="246"
              width="40"
              height="38"
              rx="3"
              fill="#45f28a"
              opacity="0.3"
              filter="url(#redux-bloom)"
            />
          </g>
          <g stroke="#08080a" strokeWidth="3" strokeLinecap="round">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${206 + i * 3.5} 292C${206 + i * 3.5} 320 ${200 + i * 3.5} 340 ${196 + i * 3.5} 362`}
              />
            ))}
          </g>
        </g>

        {/* The glass itself: a faint sheen, and the front corner where the panel wraps round. */}
        <rect x="9" y="9" width="402" height="352" fill="url(#redux-glass)" />
        <path d="M318 9V361" stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" />

        {/* PSU shroud with the R on its front corner. */}
        <path d="M9 361H411V462H9Z" fill="url(#redux-shroud)" />
        <path d="M9 361H411" stroke="#2c2c31" strokeWidth="2" />
        <path d="M40 372H300L292 382H48Z" fill="#070708" />
        <path
          d={reduxR}
          transform="translate(372 404) scale(1.15)"
          fill="#4a4a50"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
}
