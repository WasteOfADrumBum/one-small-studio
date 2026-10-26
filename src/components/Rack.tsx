import { useState, type CSSProperties, type ReactNode } from 'react';
import type { GearItem, RackSize } from '@/content/gear';
import { AvatarCab } from './AvatarCab';
import { BossGtPro } from './BossGtPro';
import { CarvinV3M } from './CarvinV3M';
import { OctoPreMkII, Scarlett18i20 } from './Focusrite';
import { FurmanM8Lx } from './Furman';
import { LiveWirePC1100 } from './LiveWirePC1100';
import { Knob } from './hardware/Knob';
import { Screw } from './hardware/Screw';
import classes from './Rack.module.css';

type CabinetProps = {
  title: string;
  /** Which power conditioner tops the rack. */
  power: 'furman' | 'livewire';
  /** Which side panel the viewer can see, from where the cabinet stands in the row. */
  side?: 'left' | 'right';
  children: ReactNode;
};

/**
 * A carpet-covered rack case: a top and one side visible for depth, a thick front frame the gear
 * sits just behind, recessed metal rails, and a plinth on casters. The rack lights on the power
 * conditioner at the top wash down over the faceplates below; its rocker powers the whole rack and
 * its dimmer sets how bright the lights are.
 */
export function RackCabinet({ title, power: conditioner, side, children }: CabinetProps) {
  const [power, setPower] = useState(true);
  const Conditioner = conditioner === 'livewire' ? LiveWirePC1100 : FurmanM8Lx;
  const [lights, setLights] = useState(100);
  return (
    <section className={classes.cabinet} data-side={side}>
      <span className={classes.top} aria-hidden="true" />
      <span className={classes.sidePanel} aria-hidden="true" />
      <div className={classes.frame}>
        <h3 className={classes.plate}>{title}</h3>
        <div
          className={classes.bay}
          data-power={power ? 'on' : 'off'}
          style={{ '--lights': power ? lights / 100 : 0 } as CSSProperties}
        >
          <span className={classes.rail} data-side="left" aria-hidden="true" />
          <span className={classes.rail} data-side="right" aria-hidden="true" />
          <div className={classes.units}>
            <Mount size={1} kind="power">
              <Conditioner
                rack={title}
                power={power}
                onPower={setPower}
                lights={lights}
                onLights={setLights}
              />
            </Mount>
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
  device,
  hidden,
  children,
}: {
  size: RackSize;
  kind: string;
  finish?: string;
  device?: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={classes.unit}
      data-kind={kind}
      data-finish={finish}
      data-device={device}
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
 * Gear that really is rack-mounted, drawn as itself: the item's size covers a 1U nameplate and the
 * units bolted in under it. The Carvin head sits on black brackets across 2U under a 2U grid vent,
 * the Boss GT-Pro fills 2U and the Focusrite pair fill 1U each.
 */
const MOUNTED: Partial<
  Record<GearItem['kind'], { device: string; size: RackSize; draw: ReactNode }[]>
> = {
  'amp-head': [{ device: 'carvin', size: 4, draw: <CarvinV3M /> }],
  effects: [{ device: 'gtpro', size: 2, draw: <BossGtPro /> }],
  interface: [
    { device: 'scarlett', size: 1, draw: <Scarlett18i20 /> },
    { device: 'octopre', size: 1, draw: <OctoPreMkII /> },
  ],
};

function Nameplate({ item }: { item: GearItem }) {
  return (
    <div className={classes.text}>
      <h4 className={classes.name}>
        {item.brand} <span className={classes.model}>{item.model}</span>
      </h4>
      <p className={classes.note}>{item.note}</p>
    </div>
  );
}

/** One piece of gear, drawn as a rack faceplate in the style of its category. Name first. */
export function RackUnit({ item }: { item: GearItem }) {
  const mounted = MOUNTED[item.kind];
  if (mounted) {
    return (
      <>
        <Mount size={1} kind="nameplate">
          <Nameplate item={item} />
        </Mount>
        {mounted.map(({ device, size, draw }) => (
          <Mount key={device} size={size} kind="device" device={device} hidden>
            {draw}
          </Mount>
        ))}
      </>
    );
  }
  return (
    <Mount size={item.size} kind={item.kind} finish={item.finish}>
      <Nameplate item={item} />
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
    // Cabinet: the white Avatar 2x12, speakers ghosting through the cloth.
    case 'speaker-cab':
      return (
        <div className={classes.hw} data-hw="cab" aria-hidden="true">
          <AvatarCab />
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
          <Knob size={28} angle={item.kind === 'cymbals' ? -50 : 60} />
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
          <Knob size={28} angle={30} />
          <span className={classes.keys} data-pads="">
            {pads(8)}
          </span>
        </div>
      );
    default:
      return null;
  }
}
