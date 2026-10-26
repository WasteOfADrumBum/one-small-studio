import type { CSSProperties, ReactNode } from 'react';
import classes from './BuildReduxTower.module.css';

/**
 * The Build Redux R, folded like their badge: a pointed roof over the stem, the bowl turning down
 * the right side and the leg kicking out below it, each facet lit a little differently. In a 40x64
 * box.
 */
const reduxFacets = {
  roof: 'M1 20L19 1L38 19L21 28L17 23L13 31Z',
  stem: 'M1 20L13 31V64L1 58Z',
  bowl: 'M21 28L38 19V40L21 36Z',
  leg: 'M21 39L39 52L29 63L21 56Z',
};

/** The R as a solid badge, light on top and darker down the sides, like the one on the shroud. */
function ReduxLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 64" className={className} preserveAspectRatio="none">
      <path d={reduxFacets.roof} fill="#8a8a93" />
      <path d={reduxFacets.stem} fill="#64646c" />
      <path d={reduxFacets.bowl} fill="#55555d" />
      <path d={reduxFacets.leg} fill="#6e6e76" />
    </svg>
  );
}

/** The R drawn in light, edge by edge, like the badge on the pump cap. */
function ReduxLogoLit({ className }: { className?: string }) {
  const edges = Object.values(reduxFacets).join(' ');
  return (
    <svg viewBox="-6 -6 52 76" className={className}>
      <path d={edges} fill="#ff2a40" fillOpacity="0.12" />
      <path
        d={edges}
        fill="none"
        stroke="#ff2a40"
        strokeWidth="6"
        strokeLinejoin="round"
        opacity="0.55"
        filter="url(#pc-bloom)"
      />
      <path d={edges} fill="none" stroke="#ffb3bb" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

const blades = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);

/**
 * A 120mm fan's face in a 100x100 box: frame corners, curved blades lit red from the hub out, and
 * the double light ring round the rim like the render's fans. Spins one way or the other.
 */
function FanFace({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg viewBox="-50 -50 100 100" className={classes.fill}>
      <rect x="-50" y="-50" width="100" height="100" rx="8" fill="url(#pc-housing)" />
      {[-41, 41].map((x) =>
        [-41, 41].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#050506" />),
      )}
      <circle r="47" fill="url(#pc-well)" />
      <g className={classes.rotor} data-reverse={reverse || undefined}>
        <circle r="44" fill="none" />
        {blades.map((turn) => (
          <path
            key={turn}
            d="M11 -6C20 -26 38 -30 44 -14A45 45 0 0 1 44 12C34 2 22 0 12 6Z"
            fill="url(#pc-blade)"
            stroke="#ff8a8f"
            strokeOpacity="0.35"
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
        <circle r="47.5" fill="none" stroke="#ffd6db" strokeWidth="1.2" opacity="0.85" />
        <circle r="45" fill="none" stroke="#ff4a5c" strokeWidth="2.4" />
        <circle
          r="16"
          fill="none"
          stroke="#ff3a2a"
          strokeWidth="7"
          opacity="0.6"
          filter="url(#pc-bloom)"
        />
        <circle r="15.5" fill="none" stroke="#ff7a5c" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

type Face = 'front' | 'right' | 'left' | 'top' | 'bottom';

type BoxProps = {
  /** Top-left-front corner, in em: x along the glass front, y down, z back from the glass. */
  at: [number, number, number];
  /** Width, height and depth in em. */
  size: [number, number, number];
  /** `end` stands it on an end wall facing along x; `down` lays it flat facing the floor. */
  turn?: 'end' | 'down';
  className?: string;
  faces: Partial<Record<Face, ReactNode>>;
};

/**
 * A solid part: a CSS 3D box built from the faces it needs, so every part has real thickness and
 * catches the light on its edges as the case turns.
 */
function Box({ at: [x, y, z], size: [w, h, d], turn, className, faces }: BoxProps) {
  const style = {
    '--x': `${x}em`,
    '--y': `${y}em`,
    '--z': `${z}em`,
    '--w': `${w}em`,
    '--h': `${h}em`,
    '--d': `${d}em`,
  } as CSSProperties;
  return (
    <div className={`${classes.box} ${className ?? ''}`} data-turn={turn} style={style}>
      {(Object.keys(faces) as Face[]).map((face) => (
        <div key={face} className={classes.face} data-face={face}>
          {faces[face]}
        </div>
      ))}
    </div>
  );
}

/** A fan with its frame's thickness and the light ring running round the frame's edge. */
function Fan({
  at,
  size,
  turn,
  reverse,
}: Pick<BoxProps, 'at' | 'turn'> & { size: number; reverse?: boolean }) {
  return (
    <Box
      at={at}
      size={[size, size, size * 0.2]}
      turn={turn}
      className={classes.fan}
      faces={{
        front: <FanFace reverse={reverse} />,
        left: null,
        right: null,
        top: null,
        bottom: null,
      }}
    />
  );
}

/** Gradients and the bloom filter shared by every part of the tower. */
function Defs() {
  return (
    <svg className={classes.defs} aria-hidden="true">
      <defs>
        <radialGradient id="pc-well" r="0.5">
          <stop offset="0.3" stopColor="#2a0508" />
          <stop offset="0.86" stopColor="#4d0811" />
          <stop offset="1" stopColor="#0d0204" />
        </radialGradient>
        <linearGradient id="pc-housing" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#222227" />
          <stop offset="1" stopColor="#0a0a0c" />
        </linearGradient>
        <radialGradient id="pc-blade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="46">
          <stop offset="0.25" stopColor="#ff7a4a" />
          <stop offset="0.55" stopColor="#c8182c" />
          <stop offset="1" stopColor="#3c0610" />
        </radialGradient>
        <radialGradient id="pc-hub" r="0.5" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#2c2c32" />
          <stop offset="1" stopColor="#0b0b0d" />
        </radialGradient>
        <radialGradient id="pc-tray" cx="0.5" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#3a0a14" />
          <stop offset="0.6" stopColor="#1c050b" />
          <stop offset="1" stopColor="#0b0205" />
        </radialGradient>
        <radialGradient id="pc-spill" r="0.5">
          <stop offset="0" stopColor="#ff2a40" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff2a40" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pc-board" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#1c181d" />
          <stop offset="1" stopColor="#0c0a0d" />
        </linearGradient>
        <linearGradient id="pc-alloy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5d5f66" />
          <stop offset="0.5" stopColor="#34353b" />
          <stop offset="1" stopColor="#1c1c21" />
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
        <pattern id="pc-mesh" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" fill="#030304" />
        </pattern>
        <filter id="pc-bloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * The back wall, 22em by 19em at 10 units an em: the MSI board in the middle, perforated panel
 * beside it, cable grommets, and the red glow the three back-wall fans throw onto it.
 */
function BackWall() {
  return (
    <svg viewBox="0 0 220 190" className={classes.fill} preserveAspectRatio="none">
      <rect width="220" height="190" fill="url(#pc-tray)" />
      <rect x="6" y="18" width="30" height="96" fill="url(#pc-mesh)" opacity="0.8" />
      {[46, 102, 158].map((y) => (
        <ellipse key={y} cx="186" cy={y} rx="40" ry="38" fill="url(#pc-spill)" />
      ))}
      <ellipse cx="60" cy="10" rx="80" ry="30" fill="url(#pc-spill)" opacity="0.7" />
      {[44, 84, 124].map((y) => (
        <rect key={y} x="150" y={y} width="5" height="24" rx="2.5" fill="#050506" />
      ))}
      <rect x="42" y="36" width="104" height="150" rx="2" fill="url(#pc-board)" stroke="#2c1d22" />
      <path
        d="M70 62h34M70 68h20M120 116h18M120 122h12M50 160h60M50 166h40M50 176h70"
        stroke="#2a1b20"
        strokeWidth="1.4"
      />
      {/* PCIe slots and the M.2 heatsink under the card, chipset plate low down. */}
      <path d="M52 118h74M52 152h74" stroke="#2e2e34" strokeWidth="3" />
      <rect x="60" y="102" width="56" height="7" rx="1.5" fill="url(#pc-alloy)" />
      <rect x="110" y="156" width="30" height="20" rx="2" fill="url(#pc-alloy)" opacity="0.8" />
      {/* The socket's backplate shadow round the pump. */}
      <rect x="78" y="68" width="40" height="40" rx="4" fill="#060506" opacity="0.8" />
    </svg>
  );
}

/** The far end wall: honeycomb behind the exhaust fan up top, slot covers below. */
function EndWall() {
  return (
    <svg viewBox="0 0 110 190" className={classes.fill} preserveAspectRatio="none">
      <rect width="110" height="190" fill="url(#pc-tray)" />
      <rect x="22" y="36" width="64" height="64" fill="url(#pc-mesh)" />
      <ellipse cx="55" cy="68" rx="46" ry="44" fill="url(#pc-spill)" />
      {[52, 64, 76].map((x) => (
        <g key={x}>
          <rect x={x} y="120" width="8" height="62" rx="1" fill="#2c2c32" />
          <rect x={x + 3} y="124" width="2" height="54" fill="url(#pc-mesh)" />
        </g>
      ))}
    </svg>
  );
}

/** The two coolant tubes, arcing down from the radiator's end tank into the top of the pump. */
function Tubes() {
  const runs = ['M98 15C98 52 40 44 8 72', 'M107 15C107 58 50 54 18 72'];
  return (
    <svg viewBox="0 0 109 80" className={classes.fill}>
      {runs.map((d) => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={d} stroke="#050506" strokeWidth="6" />
          <path d={d} stroke="#2b1a1e" strokeWidth="3" transform="translate(-1 -1)" />
          <path
            d={d}
            stroke="#ff5a6a"
            strokeOpacity="0.45"
            strokeWidth="0.8"
            transform="translate(-1.6 -1.6)"
          />
        </g>
      ))}
    </svg>
  );
}

/** The braided 12V cable rising from the top of the card and back into the wall. */
function GpuCable() {
  return (
    <svg viewBox="0 0 60 34" className={classes.fill}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${6 + i * 1.2} 34C${6 + i * 1.2} 16 30 ${12 + i * 1.2} 60 ${12 + i * 1.2}`}
          fill="none"
          stroke={i % 2 ? '#0a0a0c' : '#1e1e23'}
          strokeWidth="1.3"
        />
      ))}
    </svg>
  );
}

/**
 * Josh's Build Redux Ultra in CSS 3D, three-quarter on like Build Redux's render: glass across the
 * front and down the left side, the MSI board, pump with the lit R and the RTX 5090 on the back
 * wall with three fans stacked beside them, the 360mm radiator under the roof with its three fans
 * hanging below and two tubes running down to the pump, one exhaust fan up top at the far end, and
 * the PSU shroud with the R on its end, all on Josh's black riser.
 */
export function BuildReduxTower() {
  return (
    <div className={classes.tower} aria-hidden="true">
      <Defs />
      <div className={classes.scene}>
        <div className={classes.case}>
          <div className={`${classes.plane} ${classes.backWall}`}>
            <BackWall />
          </div>
          <div className={`${classes.plane} ${classes.endWall}`}>
            <EndWall />
          </div>
          <div className={`${classes.plane} ${classes.roof}`} />

          {/* Board parts with real height off the board. */}
          <Box
            at={[4.3, 3.9, -9.6]}
            size={[1.9, 7, 1]}
            className={classes.ioCover}
            faces={{ front: <span className={classes.msi}>MSI</span>, right: null, top: null }}
          />
          <Box
            at={[6.6, 4, -9.8]}
            size={[5.4, 1.3, 0.8]}
            className={classes.alloy}
            faces={{ front: null, right: null, bottom: null, top: null }}
          />
          {[12.7, 13.5].map((x) => (
            <Box
              key={x}
              at={[x, 3.8, -9.3]}
              size={[0.34, 6.6, 1.3]}
              className={classes.ram}
              faces={{
                front: null,
                right: <span className={`${classes.ramLight} ${classes.rainbow}`} />,
                top: <span className={`${classes.ramTop} ${classes.rainbow}`} />,
              }}
            />
          ))}
          <Box
            at={[8.2, 7.2, -8.7]}
            size={[3.2, 3.2, 1.9]}
            className={classes.pump}
            faces={{
              front: <ReduxLogoLit className={classes.pumpLogo} />,
              right: null,
              top: null,
              bottom: null,
            }}
          />

          {/* The RTX 5090, standing out from the board towards the glass. */}
          <div className={`${classes.plane} ${classes.gpuCable}`}>
            <GpuCable />
          </div>
          <Box
            at={[4, 12.4, -4.2]}
            size={[12.6, 2.4, 6.4]}
            className={classes.gpu}
            faces={{
              front: (
                <>
                  <span className={`${classes.gpuEdge} ${classes.rainbow}`} />
                  <span className={classes.rtx}>GEFORCE RTX</span>
                  <span className={`${classes.gpuBadge} ${classes.rainbow}`} />
                </>
              ),
              right: null,
              top: <span className={`${classes.gpuTopEdge} ${classes.rainbow}`} />,
              bottom: null,
            }}
          />

          {/* Three fans on the back wall beside the board, facing out through the glass. */}
          {[1.9, 7.5, 13.1].map((y, i) => (
            <Fan key={y} at={[15.9, y, -9.7]} size={5.5} reverse={i % 2 === 1} />
          ))}

          {/* The 360mm radiator under the roof, its end tank and its three fans hanging below. */}
          <Box
            at={[3, 0.35, -2.5]}
            size={[15.8, 1.15, 6.3]}
            className={classes.radiator}
            faces={{ front: null, bottom: null }}
          />
          <Box
            at={[18.8, 0.35, -2.6]}
            size={[1.5, 1.2, 6.1]}
            className={classes.tank}
            faces={{ front: null, right: null, bottom: null }}
          />
          {[3.3, 8.5, 13.7].map((x) => (
            <Fan key={x} at={[x, 2.5, -3.1]} size={5} turn="down" />
          ))}
          <div className={`${classes.plane} ${classes.tubes}`}>
            <Tubes />
          </div>

          {/* The exhaust, high on the far end wall. */}
          <Fan at={[1.3, 4.6, -3.1]} size={5} turn="end" reverse />

          {/* PSU shroud, then the glass front and left side. */}
          <Box
            at={[0, 19, 0]}
            size={[22, 5, 11]}
            className={classes.shroud}
            faces={{
              front: <span className={classes.shroudSlot} />,
              right: <ReduxLogo className={classes.shroudLogo} />,
              top: null,
            }}
          />
          <div className={`${classes.plane} ${classes.glass} ${classes.glassFront}`} />
          <div className={`${classes.plane} ${classes.glass} ${classes.glassSide}`} />

          <Box
            at={[-0.6, 24, 0.6]}
            size={[23.2, 1.6, 12.2]}
            className={classes.riser}
            faces={{ front: null, right: null, top: null }}
          />
        </div>
      </div>
    </div>
  );
}
