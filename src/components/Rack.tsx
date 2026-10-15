import type { CSSProperties, ReactNode } from 'react';
import type { GearItem, RackSize } from '@/content/gear';
import { Knob } from './hardware/Knob';
import { Led } from './hardware/Led';
import { Screw } from './hardware/Screw';
import classes from './Rack.module.css';

type CabinetProps = {
  title: string;
  /** Which side panel the viewer can see, from where the cabinet stands in the row. */
  side?: 'left' | 'right';
  children: ReactNode;
};

/**
 * A carpet-covered rack case: a top and one side visible for depth, a thick front frame the gear
 * sits just behind, recessed metal rails, and a plinth on casters. The rack lights on the power
 * conditioner at the top wash down over the faceplates below.
 */
export function RackCabinet({ title, side, children }: CabinetProps) {
  return (
    <section className={classes.cabinet} data-side={side}>
      <span className={classes.top} aria-hidden="true" />
      <span className={classes.sidePanel} aria-hidden="true" />
      <div className={classes.frame}>
        <h3 className={classes.plate}>{title}</h3>
        <div className={classes.bay}>
          <span className={classes.rail} data-side="left" aria-hidden="true" />
          <span className={classes.rail} data-side="right" aria-hidden="true" />
          <div className={classes.units}>
            <PowerConditioner />
            {children}
          </div>
          <span className={classes.wash} aria-hidden="true" />
          <span className={classes.lipShadow} aria-hidden="true" />
        </div>
      </div>
      <div className={classes.plinth} aria-hidden="true">
        <span className={classes.caster} />
        <span className={classes.caster} />
      </div>
    </section>
  );
}

function Ear({ size }: { size: RackSize }) {
  return (
    <span className={classes.ear} aria-hidden="true">
      <Screw size={9} turn={25} />
      {size > 1 && <Screw size={9} turn={-40} />}
    </span>
  );
}

/** A mounted module: ears on the rails, a faceplate between them. */
function Mount({
  size,
  kind,
  finish,
  hidden,
  children,
}: {
  size: RackSize;
  kind: string;
  finish?: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={classes.unit}
      data-kind={kind}
      data-finish={finish}
      data-size={size}
      style={{ '--size': size } as CSSProperties}
      aria-hidden={hidden || undefined}
    >
      <Ear size={size} />
      <div className={classes.face}>{children}</div>
      <Ear size={size} />
    </div>
  );
}

/**
 * The 1U power conditioner every case starts with: rack-light switch and dimmer, two pull-out
 * lamps, a status window, and the main rocker. Studio framing only, so it carries no brand, no
 * model and no live readings.
 */
function PowerConditioner() {
  return (
    <Mount size={1} kind="power" hidden>
      <span className={classes.pcGroup}>
        <span className={classes.pcLabel}>Rack lights</span>
        <span className={classes.toggle} />
        <Knob size={16} angle={40} />
      </span>
      <span className={classes.lamp} />
      <span className={classes.pcWindow}>
        <Led on color="green" />
        <span>Power</span>
      </span>
      <span className={classes.lamp} />
      <span className={classes.pcGroup}>
        <span className={classes.rocker} />
        <span className={classes.pcLabel}>On</span>
      </span>
    </Mount>
  );
}

/** One piece of gear, drawn as a rack faceplate in the style of its category. Name first. */
export function RackUnit({ item }: { item: GearItem }) {
  return (
    <Mount size={item.size} kind={item.kind} finish={item.finish}>
      <div className={classes.text}>
        <h4 className={classes.name}>
          {item.brand} <span className={classes.model}>{item.model}</span>
        </h4>
        <p className={classes.note}>{item.note}</p>
      </div>
      <Faceplate item={item} />
    </Mount>
  );
}

/** A blank or vented panel filling spare rack space. */
export function RackFiller({ kind }: { kind: 'vent' | 'blank' }) {
  return (
    <Mount size={1} kind="filler" hidden>
      {kind === 'vent' && <span className={classes.vent} />}
    </Mount>
  );
}

/** Clips on the recorder's edit screen: colour, lane top (px), start and length (% of the lanes). */
const CLIPS: [string, number, number, number][] = [
  ['#c8102e', 3, 4, 60],
  ['#8c4fc4', 16, 28, 45],
  ['#2a9bd6', 29, 10, 72],
  ['#2a9bd6', 42, 52, 34],
  ['#c9962f', 54, 66, 26],
];

const pads = (n: number) => Array.from({ length: n }, (_, i) => <i key={i} />);

/** Faceplate hardware. Decoration only: none of it is a control. */
function Faceplate({ item }: { item: GearItem }) {
  switch (item.kind) {
    // A rack recorder: a wide screen showing an edit window, and a row of transport keys.
    case 'daw':
      return (
        <div className={classes.hw} data-hw="daw" aria-hidden="true">
          <span className={classes.editScreen}>
            {/* Two copies of the clips on a reel twice the lanes' width, so the slow scroll loops. */}
            <span className={classes.lanes}>
              <span className={classes.reel}>
                {[0, 50].flatMap((offset) =>
                  CLIPS.map(([color, top, left, width], i) => (
                    <i
                      key={`${offset}-${i}`}
                      style={{
                        background: color,
                        top,
                        left: `${offset + left / 2}%`,
                        width: `${width / 2}%`,
                      }}
                    />
                  )),
                )}
              </span>
            </span>
          </span>
          <span className={classes.keys} data-row>
            {pads(5)}
          </span>
        </div>
      );
    // Scarlett-style: dark front panel with combo inputs and haloed gain controls.
    case 'interface':
      return (
        <div className={classes.hw} data-hw="interface" aria-hidden="true">
          <span className={classes.combo} />
          <span className={classes.combo} />
          <span className={classes.gains}>
            {[-40, 20, 60, -10].map((a) => (
              <span key={a} className={classes.halo}>
                <Knob size={22} angle={a} />
              </span>
            ))}
          </span>
        </div>
      );
    // Amp: a vent grille over a row of chicken-head controls, a jewel lamp and a standby switch.
    case 'amp-head':
      return (
        <div className={classes.hw} data-hw="amp" aria-hidden="true">
          <span className={classes.ampVent} />
          <span className={classes.ampRow}>
            <Led on color="red" />
            {[-60, 0, 40, -20, 70].map((a, i) => (
              <Knob key={i} size={20} angle={a} />
            ))}
            <span className={classes.toggle} />
          </span>
        </div>
      );
    // Cabinet: a grille-cloth panel with the speakers ghosting through.
    case 'speaker-cab':
      return (
        <div className={classes.hw} data-hw="cab" aria-hidden="true">
          <span className={classes.grillePanel}>
            <i />
            <i />
          </span>
        </div>
      );
    case 'effects':
      return (
        <div className={classes.hw} data-hw="effects" aria-hidden="true">
          <span className={classes.lcd} data-tone="red">
            P01
          </span>
          <span className={classes.paramKnobs}>
            {[-70, 10, 80].map((a) => (
              <Knob key={a} size={20} angle={a} />
            ))}
          </span>
          <span className={classes.keys}>{pads(6)}</span>
        </div>
      );
    // Drum-related modules: a level display, a selector dial and grouped pads.
    case 'drum':
    case 'cymbals':
      return (
        <div className={classes.hw} data-hw="module" data-variant={item.kind} aria-hidden="true">
          <span className={classes.lcd} data-tone="amber" data-bars>
            {[0.5, 0.8, 0.35, 0.65, 0.9, 0.45, 0.7, 0.3].map((h, i) => (
              <i key={i} style={{ '--h': h } as CSSProperties} />
            ))}
          </span>
          <Knob size={34} angle={item.kind === 'cymbals' ? -50 : 60} />
          <span className={classes.keys} data-pads={item.kind === 'cymbals' ? 'round' : ''}>
            {pads(item.kind === 'cymbals' ? 6 : 8)}
          </span>
        </div>
      );
    case 'drum-module':
      return (
        <div className={classes.hw} data-hw="module" aria-hidden="true">
          <span className={classes.lcd} data-tone="green">
            KIT 01
          </span>
          <Knob size={40} angle={30} />
          <span className={classes.keys} data-pads="">
            {pads(8)}
          </span>
        </div>
      );
    default:
      return null;
  }
}
