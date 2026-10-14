/**
 * The Studio gear, as three rack cabinets. One entry per rack unit; the admin will take this over
 * in a later phase.
 *
 * `size` is the unit's height in rack units (1U, 2U or 3U); the most important gear gets the most
 * panel. `finish` and `detail` only choose how the faceplate looks: they say nothing about the gear.
 */
export type RackSize = 1 | 2 | 3;
export type Finish = 'silver' | 'charcoal' | 'black' | 'oxblood' | 'slate' | 'olive';
export type Detail = 'vu' | 'display' | 'knobs' | 'leds' | 'pads' | 'grille';

export type GearItem = {
  brand: string;
  model: string;
  note: string;
  size: RackSize;
  finish: Finish;
  detail: Detail;
};

export type GearGroup = {
  name: string;
  items: GearItem[];
};

export const gear: GearGroup[] = [
  {
    name: 'Recording',
    items: [
      {
        brand: 'Avid',
        model: 'Pro Tools',
        note: 'Where every session gets tracked, edited and mixed',
        size: 3,
        finish: 'black',
        detail: 'display',
      },
      {
        brand: 'Focusrite',
        model: 'Preamps',
        note: 'Clean, quiet front end for drums and vocals',
        size: 2,
        finish: 'oxblood',
        detail: 'knobs',
      },
    ],
  },
  {
    name: 'Amps and effects',
    items: [
      {
        brand: 'Carvin',
        model: 'V3M',
        note: 'The go-to head, plus a lot of other Carvin amps over the years',
        size: 3,
        finish: 'silver',
        detail: 'vu',
      },
      {
        brand: 'Avatar',
        model: 'Cabinets',
        note: 'Speaker cabs behind the Carvins',
        size: 1,
        finish: 'charcoal',
        detail: 'grille',
      },
      {
        brand: 'Boss',
        model: 'Effects',
        note: 'Pedals for everything from ska upstrokes to metal',
        size: 2,
        finish: 'slate',
        detail: 'knobs',
      },
    ],
  },
  {
    name: 'Drums',
    items: [
      {
        brand: 'Pearl',
        model: 'Acoustic kits',
        note: 'Live and studio workhorse',
        size: 1,
        finish: 'charcoal',
        detail: 'leds',
      },
      {
        brand: 'Ludwig',
        model: 'Acoustic kits',
        note: 'The classic rock and punk sound',
        size: 2,
        finish: 'silver',
        detail: 'knobs',
      },
      {
        brand: 'Zildjian',
        model: 'Cymbals',
        note: 'Crashes, rides and hats across every kit',
        size: 2,
        finish: 'olive',
        detail: 'knobs',
      },
      {
        brand: 'Alesis',
        model: 'Electronic drums',
        note: 'Quiet practice and MIDI programming at home',
        size: 2,
        finish: 'black',
        detail: 'pads',
      },
    ],
  },
];
