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

/** The R lit red through the pump cap, its facets in brighter and darker reds. */
function ReduxLogoLit({ className }: { className?: string }) {
  const all = Object.values(reduxFacets).join(' ');
  return (
    <svg viewBox="-6 -6 52 76" className={className}>
      <path d={all} fill="#ff2a40" opacity="0.6" filter="url(#pc-bloom)" />
      <path d={reduxFacets.roof} fill="#ff7a86" />
      <path d={reduxFacets.stem} fill="#e0283c" />
      <path d={reduxFacets.bowl} fill="#b81a2e" />
      <path d={reduxFacets.leg} fill="#f04052" />
    </svg>
  );
}

/**
 * The four mounting brackets that hold a round fan's frame: a lug with a screw hole at each corner,
 * on an arm running in from the ring, so the frame reads as a circle crossed by an X.
 */
function FanBrackets({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      {[45, 135, 225, 315].map((turn) => (
        <path key={turn} d="M38 -9L58 -6A6 6 0 0 1 58 6L38 9Z" transform={`rotate(${turn})`} />
      ))}
      {[45, 135, 225, 315].map((turn) => (
        <circle key={turn} cx="57" cy="0" r="2.2" fill="#030304" transform={`rotate(${turn})`} />
      ))}
    </g>
  );
}

/**
 * A 120mm fan's face, round in a 100x100 box with only its brackets reaching the corners, ringed
 * in red light. Josh has two kinds: the radiator and exhaust fans (`hub`) glow through a big
 * frosted hub, a bright ring round a dark centre, their blades faint behind it; the three on the
 * back wall show five broad swirled blades, black-edged, lit red from the middle. Spins one way
 * or the other.
 */
function FanFace({ reverse = false, hub = false }: { reverse?: boolean; hub?: boolean }) {
  const count = hub ? 7 : 5;
  return (
    <svg viewBox="-50 -50 100 100" className={classes.fill} overflow="visible">
      <FanBrackets fill="url(#pc-housing)" />
      <circle r="49" fill="#141417" />
      <circle r="46" fill="url(#pc-well)" />
      <g className={classes.rotor} data-reverse={reverse || undefined}>
        <circle r="44" fill="none" />
        {Array.from({ length: count }, (_, i) => (
          <path
            key={i}
            d={
              hub
                ? 'M11 -6C20 -26 38 -30 44 -14A45 45 0 0 1 44 12C34 2 22 0 12 6Z'
                : 'M8 -10C22 -34 46 -26 45 -6A45 45 0 0 1 36 26C34 6 24 -4 10 2Z'
            }
            fill="url(#pc-blade)"
            opacity={hub ? 0.45 : 1}
            stroke={hub ? '#ff8a8f' : '#120204'}
            strokeOpacity={hub ? 0.3 : 0.9}
            strokeWidth={hub ? 0.7 : 1.6}
            transform={`rotate(${(i * 360) / count})`}
          />
        ))}
        {!hub && <circle r="12" fill="url(#pc-hub)" />}
      </g>
      {hub && (
        <g className={classes.glow}>
          <circle r="22" fill="#ff8a5a" opacity="0.7" filter="url(#pc-bloom)" />
          <circle r="20" fill="url(#pc-frost)" />
          <circle r="10.5" cx="1.5" cy="2" fill="#140306" />
        </g>
      )}
      <g className={classes.glow}>
        <circle
          r="45"
          fill="none"
          stroke="#ff2a40"
          strokeWidth="9"
          opacity="0.45"
          filter="url(#pc-bloom)"
        />
        <circle r="48" fill="none" stroke="#ffd6db" strokeWidth="1.2" opacity="0.85" />
        <circle r="45" fill="none" stroke="#ff4a5c" strokeWidth="2.4" />
        {!hub && (
          <>
            <circle
              r="15"
              fill="none"
              stroke="#ff3a2a"
              strokeWidth="7"
              opacity="0.6"
              filter="url(#pc-bloom)"
            />
            <circle r="14" fill="none" stroke="#ff7a5c" strokeWidth="1.6" />
          </>
        )}
      </g>
    </svg>
  );
}

/** The back of a fan's frame: its brackets and a second light ring, a frame's depth behind. */
function FanBack() {
  return (
    <svg viewBox="-50 -50 100 100" className={classes.fill} overflow="visible">
      <FanBrackets fill="#0e0e11" />
      <circle r="47" fill="none" stroke="#141417" strokeWidth="4" />
      <g className={classes.glow}>
        <circle
          r="46"
          fill="none"
          stroke="#ff2a40"
          strokeWidth="7"
          opacity="0.4"
          filter="url(#pc-bloom)"
        />
        <circle r="46" fill="none" stroke="#ff4a5c" strokeWidth="2" />
      </g>
    </svg>
  );
}

type Face = 'front' | 'middle' | 'back' | 'right' | 'left' | 'top' | 'bottom';

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

/**
 * A round fan with its frame's depth: the lit face, and two more light rings and the brackets
 * behind it, so the side of the frame shows the stacked arcs Josh's fans have.
 */
function Fan({
  at,
  size,
  turn,
  reverse,
  hub,
}: Pick<BoxProps, 'at' | 'turn'> & { size: number; reverse?: boolean; hub?: boolean }) {
  return (
    <Box
      at={at}
      size={[size, size, size * 0.2]}
      turn={turn}
      className={classes.fan}
      faces={{
        back: <FanBack />,
        middle: <FanBack />,
        front: <FanFace reverse={reverse} hub={hub} />,
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
        <radialGradient id="pc-frost" r="0.5">
          <stop offset="0.45" stopColor="#fff1c8" />
          <stop offset="0.75" stopColor="#ffb070" />
          <stop offset="1" stopColor="#ff4a3a" />
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
        <linearGradient id="pc-frame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#55565d" />
          <stop offset="0.5" stopColor="#3a3b41" />
          <stop offset="1" stopColor="#25262b" />
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
      {/* The 24-pin's braided leads down the right edge of the board. */}
      <path
        d={Array.from(
          { length: 9 },
          (_, i) =>
            `M${140 + i * 1.6} 58C${136 + i * 1.6} 80 ${138 + i * 1.6} 96 ${148 + i * 1.2} 116`,
        ).join('')}
        stroke="#050506"
        strokeWidth="1.3"
        fill="none"
      />
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

/** A tube's dark sleeve with a red highlight along its upper edge, so it reads as round. */
function TubeStroke({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#050506" strokeWidth="6.5" />
      <path d={d} stroke="#241418" strokeWidth="3" transform="translate(-1 -1)" />
      <path
        d={d}
        stroke="#ff5a6a"
        strokeOpacity="0.45"
        strokeWidth="0.8"
        transform="translate(-1.8 -1.8)"
      />
    </g>
  );
}

/**
 * Where the tubes leave the pump: two fittings on its left side, the tubes curling down the left
 * of it and round underneath to head right. Drawn just behind the pump's face, from 6.4em along
 * and 7em down, at 10 units an em.
 */
function TubeExits() {
  return (
    <svg viewBox="0 0 30 64" className={classes.fill} overflow="visible">
      <TubeStroke d="M17 12C5 12 2 28 4 42C6 54 14 58 30 58" />
      <TubeStroke d="M17 24C11 24 9 34 10 44C11 51 18 54 30 54" />
      <rect x="15" y="9" width="4" height="6" rx="1" fill="#2a2a30" />
      <rect x="15" y="21" width="4" height="6" rx="1" fill="#2a2a30" />
    </svg>
  );
}

/**
 * The run of one coolant tube, in a plane from under the pump to the foot of its riser, at 10
 * units an em: along above the card, then turning up. `length` is the plane's run in em; `at` is
 * its height in units down from the top of the case.
 */
function TubeRun({ length, at }: { length: number; at: number }) {
  const end = length * 10;
  return (
    <svg viewBox={`0 0 ${end} 200`} className={classes.fill} overflow="visible">
      <TubeStroke d={`M0 ${at}H${end - 22}C${end - 4} ${at} ${end} ${at - 6} ${end} 112`} />
    </svg>
  );
}

/**
 * The two tubes rising to the tank, in a plane across the case's depth: each climbs from the end
 * of its run to the opposite end of the tank, so they cross on the way up, in and out.
 */
function TubeRisers() {
  return (
    <svg viewBox="0 0 64 200" className={classes.fill} overflow="visible">
      <TubeStroke d="M60 112C60 70 6 66 6 14" />
      <TubeStroke d="M6 112C6 70 60 66 60 14" />
    </svg>
  );
}

/**
 * The braided 12V cable: over the top edge of the card from its plug, then down the face, bowing
 * out and curling away to the left as it drops into the shroud.
 */
function GpuCable() {
  return (
    <svg viewBox="0 0 30 64" className={classes.fill} overflow="visible">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${14 + i * 1.8} 0C${14 + i * 1.8} 14 ${18 + i * 1.6} 24 ${14 + i * 1.5} 40S${2 + i * 1.4} 56 ${-2 + i * 1.4} 66`}
          fill="none"
          stroke={i % 2 ? '#0d0d10' : '#2a2a30'}
          strokeWidth="1.7"
        />
      ))}
    </svg>
  );
}

/**
 * The face of Josh's TUF RTX 5090, 18.4em by 4.4em at 10 units an em (from -14): an open metal frame with
 * angled struts over the fin stack, the GEFORCE RTX plate, and the lit TUF badge on the end.
 */
function GpuFace() {
  return (
    <svg viewBox="-14 0 184 44" className={classes.fill} preserveAspectRatio="none">
      <rect x="-14" width="184" height="44" fill="#0c0c0f" />
      {/* The fin stack, seen through the frame. */}
      <path
        d={Array.from({ length: 71 }, (_, i) => `M${-10 + i * 2} 6V40`).join('')}
        stroke="#2c2c33"
        strokeWidth="0.8"
      />
      <g fill="url(#pc-frame)">
        <rect x="-14" width="184" height="4" />
        <rect x="-14" y="40" width="184" height="4" />
        <rect x="-14" width="4" height="44" />
        <path d="M0 0H26L48 26H40V44H0V36H22V18L8 4H0Z" />
        <path d="M56 4L76 26H86L106 4H96L81 21L66 4Z" />
        <path d="M106 4H134V10H106Z" />
        <path d="M40 26H140V44H40Z" />
      </g>
      {/* The little row of chevrons along the top right. */}
      <path
        d="M108 5L112 9L116 5ZM117 5L121 9L125 5ZM126 5L130 9L134 5Z"
        fill="#0c0c0f"
        opacity="0.9"
      />
      <text x="48" y="38.5" className={classes.rtx}>
        GEFORCE RTX
      </text>
      <path
        d="M104 36L108 30H112L108 36ZM112 36L116 30H120L116 36ZM120 36L124 30H128L124 36Z"
        fill="#8d8f96"
      />
      {/* The TUF end: a dark block with the shield badge and its corner lights. */}
      <rect x="140" width="30" height="44" fill="#15151a" />
      <rect x="140" width="30" height="44" fill="none" stroke="#3a3b42" strokeWidth="1" />
      <g className={classes.rainbow} transform="translate(155 4) scale(0.8) translate(-152 0)">
        <path
          d="M144 14H160V22L152 29L144 22ZM148 17V22L152 25L156 22V17H153V22H151V17Z"
          fill="url(#pc-rainbow-x)"
          fillRule="evenodd"
        />
        <path
          d="M144 14H160V22L152 29L144 22Z"
          fill="url(#pc-rainbow-x)"
          opacity="0.45"
          filter="url(#pc-bloom)"
        />
        <path
          d="M139 8l3 2M165 8l-3 2M139 30l3 -2M165 30l-3 -2"
          stroke="url(#pc-rainbow-x)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {[150, 154, 158, 162, 166].map((x) => (
          <circle key={x} cx={x} cy="37" r="1.1" fill="url(#pc-rainbow-x)" />
        ))}
      </g>
    </svg>
  );
}

/** The card's top, its backplate cut away in angled windows, with the cable's plug in the middle. */
function GpuTop() {
  return (
    <svg viewBox="-14 0 184 70" className={classes.fill} preserveAspectRatio="none">
      <rect x="-14" width="184" height="70" fill="url(#pc-frame)" />
      <path
        d="M30 10H70L60 34H24ZM80 10H120L132 30H90ZM140 10H162V40L146 30ZM30 44H90L84 60H24Z"
        fill="#0b0b0e"
      />
      <rect x="96" y="2" width="14" height="6" rx="1" fill="#050506" />
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
            at={[4.1, 3.8, -9.5]}
            size={[2.3, 8.8, 1.1]}
            className={classes.ioCover}
            faces={{ front: <span className={classes.msi}>MSI</span>, right: null, top: null }}
          />
          <Box
            at={[6.4, 3.8, -9.8]}
            size={[5.8, 1.6, 0.9]}
            className={`${classes.ioCover} ${classes.vrm}`}
            faces={{ front: null, right: null, bottom: null, top: null }}
          />
          {[12.6, 13.5].map((x) => (
            <Box
              key={x}
              at={[x, 3.8, -9.3]}
              size={[0.42, 6.6, 1.3]}
              className={classes.ram}
              faces={{
                front: <span className={`${classes.ramLight} ${classes.rainbow}`} />,
                right: null,
                top: null,
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

          {/* The RTX 5090: long, thick and low, just above the shroud, its cable down the face. */}
          <Box
            at={[1, 13.8, -2.6]}
            size={[18.4, 4.4, 7]}
            className={classes.gpu}
            faces={{
              front: <GpuFace />,
              right: null,
              top: <GpuTop />,
              bottom: null,
            }}
          />
          <div className={`${classes.plane} ${classes.gpuCable}`}>
            <GpuCable />
          </div>

          {/* Three fans on the back wall beside the board, facing out through the glass. */}
          {[1.9, 7.5, 13.1].map((y, i) => (
            <Fan key={y} at={[15.9, y, -9.7]} size={5.5} reverse={i % 2 === 1} />
          ))}

          {/* The 360mm radiator under the roof, its end tank and its three fans hanging below. */}
          <Box
            at={[2, 0.35, -2.4]}
            size={[17, 1.15, 6.6]}
            className={classes.radiator}
            faces={{ front: null, bottom: null }}
          />
          <Box
            at={[18.8, 0.35, -2.6]}
            size={[1.5, 1.2, 6.1]}
            className={classes.tank}
            faces={{ front: null, right: null, bottom: null }}
          />
          {[2.3, 7.95, 13.6].map((x) => (
            <Fan key={x} at={[x, 2.6, -2.8]} size={5.5} turn="down" hub />
          ))}
          {/* Two tubes off the pump's left side, round under it, crossing as they climb to the tank. */}
          <div className={`${classes.plane} ${classes.tubeExits}`}>
            <TubeExits />
          </div>
          <div className={`${classes.plane} ${classes.tube} ${classes.tubeNear}`}>
            <TubeRun length={11.81} at={128} />
          </div>
          <div className={`${classes.plane} ${classes.tube} ${classes.tubeFar}`}>
            <TubeRun length={10.21} at={124} />
          </div>
          <div className={`${classes.plane} ${classes.risers}`}>
            <TubeRisers />
          </div>

          {/* The exhaust, high on the far end wall. */}
          <Fan at={[1.4, 4.2, -2.8]} size={5.5} turn="end" reverse hub />

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
