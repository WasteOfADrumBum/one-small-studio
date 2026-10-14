import type { CSSProperties, ReactNode } from 'react';
import { rackMounted, type GearItem, type RackSize } from '@/content/gear';
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
 * sits just behind, recessed metal rails, and a plinth on casters.
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
          <div className={classes.units}>{children}</div>
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

function Label({ item }: { item: GearItem }) {
  return (
    <div className={classes.text}>
      <h4 className={classes.name}>
        {item.brand} <span className={classes.model}>{item.model}</span>
      </h4>
      <p className={classes.note}>{item.note}</p>
    </div>
  );
}

/**
 * One piece of gear. Rack-mount gear is a faceplate on the rails; amps, cabs, drums and the DAW sit
 * on a rack shelf, drawn as themselves. Either way the name and note come first.
 */
export function RackUnit({ item }: { item: GearItem }) {
  const mounted = rackMounted.includes(item.kind);
  return (
    <article
      className={classes.unit}
      data-mount={mounted ? 'rack' : 'shelf'}
      data-kind={item.kind}
      data-size={item.size}
      style={{ '--size': item.size } as CSSProperties}
    >
      <Ear size={item.size} />
      {mounted ? (
        <div className={classes.face}>
          <Label item={item} />
          <Faceplate item={item} />
        </div>
      ) : (
        <div className={classes.shelf}>
          <div className={classes.shelfBody}>
            <Gear item={item} />
            <Label item={item} />
          </div>
          <span className={classes.tray} aria-hidden="true" />
        </div>
      )}
      <Ear size={item.size} />
    </article>
  );
}

/** A blank or vented panel filling spare rack space. */
export function RackFiller({ kind }: { kind: 'vent' | 'blank' }) {
  return (
    <div
      className={classes.unit}
      data-mount="rack"
      data-kind="filler"
      data-size={1}
      style={{ '--size': 1 } as CSSProperties}
      aria-hidden="true"
    >
      <Ear size={1} />
      <div className={classes.face}>{kind === 'vent' && <span className={classes.vent} />}</div>
      <Ear size={1} />
    </div>
  );
}

/** Faceplate hardware for rack-mount gear. Decoration only: none of it is a control. */
function Faceplate({ item }: { item: GearItem }) {
  switch (item.kind) {
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
          <span className={classes.keys}>
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} />
            ))}
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
          <span className={classes.keys} data-pads>
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </div>
      );
    default:
      return null;
  }
}

/** The gear itself, standing on the shelf. */
function Gear({ item }: { item: GearItem }) {
  switch (item.kind) {
    case 'daw':
      return (
        <span className={classes.laptop} aria-hidden="true">
          <span className={classes.laptopScreen}>
            {[
              ['#c8102e', 10, 70],
              ['#8c4fc4', 30, 55],
              ['#2a9bd6', 5, 80],
              ['#2a9bd6', 45, 40],
              ['#c9962f', 60, 35],
            ].map(([color, left, width], i) => (
              <i
                key={i}
                // Clips sit to the right of the track headers, which take the first fifth.
                style={{
                  background: color as string,
                  left: `${20 + (left as number) * 0.78}%`,
                  width: `${(width as number) * 0.78}%`,
                }}
              />
            ))}
          </span>
          <span className={classes.laptopBase} />
        </span>
      );
    case 'amp-head':
      return (
        <span className={classes.ampHead} aria-hidden="true">
          <span className={classes.handle} />
          <span className={classes.ampCage}>
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className={classes.ampPanel}>
            <Led on color="red" />
            {[-60, 0, 40, -20, 70, 10].map((a, i) => (
              <Knob key={i} size={14} angle={a} />
            ))}
          </span>
        </span>
      );
    case 'speaker-cab':
      return (
        <span className={classes.cab} aria-hidden="true">
          <span className={classes.grille}>
            <i />
            <i />
          </span>
          <span className={classes.corner} data-c="tl" />
          <span className={classes.corner} data-c="tr" />
          <span className={classes.corner} data-c="bl" />
          <span className={classes.corner} data-c="br" />
        </span>
      );
    case 'drum':
      return (
        <span className={classes.drum} data-shell={item.shell} aria-hidden="true">
          <span className={classes.hoop} />
          <span className={classes.shellBody}>
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className={classes.hoop} />
        </span>
      );
    case 'cymbals':
      return (
        <span className={classes.cymbals} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      );
    default:
      return null;
  }
}
