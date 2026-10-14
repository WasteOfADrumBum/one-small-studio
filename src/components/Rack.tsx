import type { CSSProperties, ReactNode } from 'react';
import type { Detail, Finish, GearItem, RackSize } from '@/content/gear';
import { Knob } from './hardware/Knob';
import { Led } from './hardware/Led';
import { Screw } from './hardware/Screw';
import classes from './Rack.module.css';

type CabinetProps = {
  title: string;
  /** Which outer side of the row this cabinet is on, so its side panel shows a little depth. */
  edge?: 'left' | 'right';
  children: ReactNode;
};

/** A wooden rack cabinet with recessed rails. Units passed in mount to the rails top to bottom. */
export function RackCabinet({ title, edge, children }: CabinetProps) {
  return (
    <section className={classes.cabinet} data-edge={edge}>
      <div className={classes.top} aria-hidden="true" />
      <div className={classes.frame}>
        <div className={classes.bay}>
          <span className={classes.rail} data-side="left" aria-hidden="true" />
          <span className={classes.rail} data-side="right" aria-hidden="true" />
          <div className={classes.plate}>
            <h3 className={classes.plateTitle}>{title}</h3>
          </div>
          <div className={classes.units}>{children}</div>
        </div>
      </div>
      <div className={classes.plinth} aria-hidden="true" />
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

/** One mounted unit: what the gear is and why it matters, on a faceplate sized by rack units. */
export function RackUnit({ item }: { item: GearItem }) {
  return (
    <article
      className={classes.unit}
      data-finish={item.finish}
      data-size={item.size}
      style={{ '--size': item.size } as CSSProperties}
    >
      <Ear size={item.size} />
      <div className={classes.face}>
        <div className={classes.text}>
          <h4 className={classes.name}>
            {item.brand} <span className={classes.model}>{item.model}</span>
          </h4>
          <p className={classes.note}>{item.note}</p>
        </div>
        <UnitDetail detail={item.detail} size={item.size} finish={item.finish} />
      </div>
      <Ear size={item.size} />
    </article>
  );
}

/** A blank or vented panel that fills the rack so the three cabinets stand the same height. */
export function RackFiller({ kind }: { kind: 'vent' | 'blank' }) {
  return (
    <div
      className={classes.unit}
      data-finish="filler"
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

const KNOB_ANGLES = [-60, 30, 110, -10];

/** Faceplate hardware. Pure decoration: it gives each unit a character, never a fake control. */
function UnitDetail({ detail, size, finish }: { detail: Detail; size: RackSize; finish: Finish }) {
  const light = finish === 'silver';
  return (
    <div className={classes.detail} data-detail={detail} data-size={size} aria-hidden="true">
      {detail === 'vu' && (
        <span className={classes.vu}>
          <svg viewBox="0 0 80 46">
            <path d="M10 38 A34 34 0 0 1 70 38" className={classes.vuScale} />
            <path d="M56 13 A34 34 0 0 1 70 38" className={classes.vuRed} />
            <line x1="40" y1="42" x2="26" y2="12" className={classes.vuNeedle} />
            <text x="40" y="40" textAnchor="middle">
              VU
            </text>
          </svg>
        </span>
      )}
      {detail === 'display' && (
        <span className={classes.display}>
          {[0.55, 0.8, 0.4, 0.7, 0.3, 0.6, 0.85, 0.5].map((h, i) => (
            <i key={i} style={{ '--h': h } as CSSProperties} />
          ))}
        </span>
      )}
      {detail === 'knobs' &&
        KNOB_ANGLES.slice(0, size === 1 ? 2 : size === 2 ? 3 : 4).map((a) => (
          <Knob key={a} size={size === 1 ? 22 : 30} angle={a} />
        ))}
      {detail === 'leds' && (
        <span className={classes.leds}>
          <Led on color="green" />
          <Led on={size > 1} color="green" />
          <Led on color="amber" />
          <Led on={false} color="red" />
        </span>
      )}
      {detail === 'pads' && (
        <span className={classes.pads}>
          {Array.from({ length: 4 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      )}
      {detail === 'grille' && <span className={classes.grille} data-light={light || undefined} />}
    </div>
  );
}
