import classes from './BuildReduxTower.module.css';

/** The Build Redux "R": a squared-off bowl with a leg kicked out like a chevron, in a 20x24 box. */
const reduxR = 'M0 0H13L20 7V12L15 17L20 24H13L8 17H6V24H0ZM6 6V11H12L13 10V7L12 6Z';

const blades = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);

/**
 * A 120mm fan, face on, in a 100x100 box: dark housing, shutter-style blades that sweep round the
 * hub, and the red light ring round the rim and the hub. Spins unless `still`.
 */
function Fan({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg viewBox="-50 -50 100 100" className={classes.fan}>
      <rect x="-50" y="-50" width="100" height="100" rx="9" fill="url(#pc-housing)" />
      <circle r="46" fill="url(#pc-well)" />
      <g className={classes.rotor} data-reverse={reverse || undefined}>
        <circle r="44" fill="none" />
        {blades.map((turn) => (
          <path
            key={turn}
            d="M11 -6C20 -26 38 -30 45 -14A46 46 0 0 1 45 12C34 2 22 0 12 6Z"
            fill="url(#pc-blade)"
            stroke="rgb(255 140 150 / 0.45)"
            strokeWidth="0.7"
            transform={`rotate(${turn})`}
          />
        ))}
        <circle r="13" fill="url(#pc-hub)" />
      </g>
      <g className={classes.glow}>
        <circle
          r="45"
          fill="none"
          stroke="#ff2a40"
          strokeWidth="9"
          opacity="0.45"
          filter="url(#pc-bloom)"
        />
        <circle r="45" fill="none" stroke="#ff5466" strokeWidth="2.6" />
        <circle r="45" fill="none" stroke="#ffd0d5" strokeWidth="0.8" opacity="0.8" />
        <circle
          r="15"
          fill="none"
          stroke="#ff2a40"
          strokeWidth="6"
          opacity="0.5"
          filter="url(#pc-bloom)"
        />
        <circle r="15" fill="none" stroke="#ff6676" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/** Gradients and the bloom filter shared by every part of the tower. */
function Defs() {
  return (
    <svg className={classes.defs} aria-hidden="true">
      <defs>
        <radialGradient id="pc-well" r="0.5">
          <stop offset="0.3" stopColor="#1c0306" />
          <stop offset="0.86" stopColor="#4d0811" />
          <stop offset="1" stopColor="#0d0204" />
        </radialGradient>
        <linearGradient id="pc-housing" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#1d1d22" />
          <stop offset="1" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="pc-blade" x1="0" x2="1" y1="0" y2="0.3">
          <stop offset="0" stopColor="#3a0710" />
          <stop offset="0.6" stopColor="#8d1424" />
          <stop offset="1" stopColor="#ff4d60" />
        </linearGradient>
        <radialGradient id="pc-hub" r="0.5" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#2c2c32" />
          <stop offset="1" stopColor="#0b0b0d" />
        </radialGradient>
        <radialGradient id="pc-tray" cx="0.55" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#3b0812" />
          <stop offset="0.6" stopColor="#1a0408" />
          <stop offset="1" stopColor="#090204" />
        </radialGradient>
        <linearGradient id="pc-board" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#17141a" />
          <stop offset="1" stopColor="#0b0a0d" />
        </linearGradient>
        <linearGradient id="pc-alloy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5d5f66" />
          <stop offset="0.5" stopColor="#34353b" />
          <stop offset="1" stopColor="#1c1c21" />
        </linearGradient>
        <linearGradient id="pc-shroud-io" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#b9a7ab" />
          <stop offset="0.5" stopColor="#e5d9dc" />
          <stop offset="1" stopColor="#a4878d" />
        </linearGradient>
        <linearGradient id="pc-gpu" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a4b52" />
          <stop offset="0.18" stopColor="#2b2c31" />
          <stop offset="1" stopColor="#111114" />
        </linearGradient>
        <linearGradient id="pc-rainbow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#36d6ff" />
          <stop offset="0.25" stopColor="#6a5cff" />
          <stop offset="0.5" stopColor="#ff4fd8" />
          <stop offset="0.75" stopColor="#ffb547" />
          <stop offset="1" stopColor="#5fe08a" />
        </linearGradient>
        <linearGradient id="pc-rainbow-x" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#36d6ff" />
          <stop offset="0.33" stopColor="#5fe08a" />
          <stop offset="0.66" stopColor="#ffb547" />
          <stop offset="1" stopColor="#ff4fd8" />
        </linearGradient>
        <linearGradient id="pc-tube" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#020203" />
          <stop offset="0.45" stopColor="#2a1418" />
          <stop offset="1" stopColor="#020203" />
        </linearGradient>
        <filter id="pc-bloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
    </svg>
  );
}

/** The motherboard tray: the MSI board, cooler block with the lit R, RGB memory and the tubes. */
function Tray() {
  return (
    <svg viewBox="0 0 220 190" className={classes.fill} preserveAspectRatio="none">
      <rect width="220" height="190" fill="url(#pc-tray)" />
      {/* Cable grommets in the tray, beside the board. */}
      {[40, 78, 116].map((y) => (
        <rect key={y} x="186" y={y} width="9" height="26" rx="3" fill="#050506" />
      ))}
      <rect x="30" y="16" width="142" height="164" rx="2" fill="url(#pc-board)" stroke="#2a1d22" />
      <path
        d="M58 40h40M58 46h26M150 120h16M150 126h10M44 160h60M44 166h40"
        stroke="#2a1b20"
        strokeWidth="1.4"
      />
      {/* VRM heatsink and the white I/O cover with the MSI badge. */}
      <rect x="54" y="20" width="58" height="13" rx="2" fill="url(#pc-alloy)" />
      <rect x="30" y="18" width="20" height="66" rx="2" fill="url(#pc-shroud-io)" />
      <text x="40" y="51" className={classes.msi} transform="rotate(-90 40 51)">
        MSI
      </text>
      {/* M.2 heatsink and chipset plate. */}
      <rect x="58" y="104" width="64" height="7" rx="1.5" fill="url(#pc-alloy)" />
      <rect x="130" y="150" width="34" height="22" rx="2" fill="url(#pc-alloy)" opacity="0.8" />

      {/* RGB memory: rainbow light bars that fade through the colours. */}
      <rect x="128" y="26" width="20" height="74" fill="#0b0b0e" />
      <g className={classes.rainbow}>
        <rect
          x="124"
          y="22"
          width="28"
          height="82"
          fill="url(#pc-rainbow)"
          opacity="0.5"
          filter="url(#pc-bloom)"
        />
        <rect x="131" y="27" width="5" height="72" rx="1" fill="url(#pc-rainbow)" />
        <rect x="140" y="27" width="5" height="72" rx="1" fill="url(#pc-rainbow)" />
      </g>

      {/* Pump block with the R, and its tubes running up to the radiator. */}
      <g fill="none" strokeLinecap="round">
        <path d="M92 54C92 22 196 34 206 0" stroke="url(#pc-tube)" strokeWidth="8" />
        <path d="M108 54C112 28 206 44 214 0" stroke="url(#pc-tube)" strokeWidth="8" />
      </g>
      <rect
        x="80"
        y="50"
        width="40"
        height="40"
        rx="6"
        fill="#141418"
        stroke="#35353b"
        strokeWidth="1.5"
      />
      <rect x="85" y="55" width="30" height="30" rx="4" fill="#1c0408" />
      <rect
        x="85"
        y="55"
        width="30"
        height="30"
        rx="4"
        fill="#ff2a40"
        opacity="0.35"
        filter="url(#pc-bloom)"
      />
      <path d={reduxR} transform="translate(91 59) scale(0.9)" fill="#ff4256" fillRule="evenodd" />

      {/* Expansion slot covers on the back wall, below the board's top half. */}
      <g stroke="#26262b" strokeWidth="4">
        {[118, 130, 142, 154, 166].map((y) => (
          <path key={y} d={`M4 ${y}h22`} />
        ))}
      </g>
    </svg>
  );
}

/** The RTX 5090, nearer the glass than the board, with its rainbow light bar and badge. */
function Gpu() {
  return (
    <svg viewBox="0 0 220 190" className={classes.fill} preserveAspectRatio="none">
      {/* Power cable, braided, dropping into the shroud. */}
      <g stroke="#060607" strokeWidth="2.6" strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M${104 + i * 3} 140C${104 + i * 3} 160 ${98 + i * 3} 176 ${96 + i * 3} 192`}
          />
        ))}
      </g>
      <path
        d="M22 112H196L204 119V138L196 144H22L16 138V118Z"
        fill="url(#pc-gpu)"
        stroke="#55565d"
        strokeWidth="0.8"
      />
      <path d="M22 113H196" stroke="#8a8b92" strokeWidth="0.8" opacity="0.7" />
      {/* Shroud facets and fin stack. */}
      <path
        d="M60 116L78 128L60 140M120 116L138 128"
        fill="none"
        stroke="#151518"
        strokeWidth="4"
      />
      <g stroke="#3a3b41" strokeWidth="0.8">
        {Array.from({ length: 20 }, (_, i) => (
          <path key={i} d={`M${84 + i * 2.6} 118v20`} />
        ))}
      </g>
      <text x="30" y="135" className={classes.rtx}>
        GEFORCE RTX
      </text>
      <rect x="168" y="118" width="26" height="22" rx="2" fill="#0a0a0c" />
      <g className={classes.rainbow}>
        <path d="M24 111.5H150" stroke="url(#pc-rainbow-x)" strokeWidth="1.6" />
        <path
          d="M24 111.5H150"
          stroke="url(#pc-rainbow-x)"
          strokeWidth="5"
          opacity="0.5"
          filter="url(#pc-bloom)"
        />
        <path d="M174 123h14v4l-3 3v6h-8v-6l-3 -3z" fill="url(#pc-rainbow-x)" />
        <rect
          x="166"
          y="116"
          width="30"
          height="26"
          rx="3"
          fill="url(#pc-rainbow-x)"
          opacity="0.35"
          filter="url(#pc-bloom)"
        />
        <path
          d="M171 121v3M191 121v3M171 135v3M191 135v3"
          stroke="url(#pc-rainbow-x)"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}

/** A plane of fans laid out along its length: the radiator above, or the stacked front intakes. */
function FanRow({ count, reverse = false }: { count: number; reverse?: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Fan key={i} reverse={reverse} />
      ))}
    </>
  );
}

/**
 * Josh's Build Redux Ultra, built as a box in CSS 3D and seen three-quarter on: the glass side and
 * the glass front, with the radiator's three fans overhead, the rear exhaust, three front intakes,
 * the cooler block with the R, rainbow RGB memory and the RTX 5090 inside, on its black riser.
 */
export function BuildReduxTower() {
  return (
    <div className={classes.tower} aria-hidden="true">
      <Defs />
      <div className={classes.scene}>
        <div className={classes.case}>
          <div className={classes.tray}>
            <Tray />
          </div>
          <div className={classes.gpu}>
            <Gpu />
          </div>
          <div className={classes.rear}>
            <Fan reverse />
          </div>
          <div className={classes.radiator}>
            <FanRow count={3} />
          </div>
          <div className={classes.intakes}>
            <FanRow count={3} reverse />
          </div>
          <div className={classes.shroudTop} />
          <div className={classes.side}>
            <span className={classes.sideShroud} />
          </div>
          <div className={classes.front}>
            <span className={classes.frontShroud}>
              <svg viewBox="0 0 20 24" className={classes.logo}>
                <path d={reduxR} fillRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className={classes.riserTop} />
          <div className={classes.riserSide} />
          <div className={classes.riserFront} />
        </div>
      </div>
    </div>
  );
}
