/**
 * The Studio gear, in three rack cabinets. The admin will take this list over in a later phase.
 *
 * Every item is drawn as a rack-mounted module, whatever it really is. `size` is its height in rack
 * units (U) and `kind` picks the faceplate style that suggests its category. Both are presentation
 * only and say nothing about specs, ownership, or whether the real thing is rack gear.
 */
export type RackSize = 1 | 2 | 3;

export type GearKind =
  'daw' | 'interface' | 'amp-head' | 'speaker-cab' | 'effects' | 'drum' | 'cymbals' | 'drum-module';

export type GearItem = {
  brand: string;
  model: string;
  note: string;
  size: RackSize;
  kind: GearKind;
  /** Faceplate finish; decorative. */
  finish?: 'black' | 'silver';
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
        kind: 'daw',
      },
      {
        brand: 'Focusrite',
        model: 'Preamps',
        note: 'Clean, quiet front end for drums and vocals',
        size: 3,
        kind: 'interface',
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
        kind: 'amp-head',
      },
      {
        brand: 'Avatar',
        model: 'Cabinets',
        note: 'Speaker cabs behind the Carvins',
        size: 3,
        kind: 'speaker-cab',
      },
      {
        brand: 'Boss',
        model: 'Effects',
        note: 'Pedals for everything from ska upstrokes to metal',
        size: 2,
        kind: 'effects',
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
        size: 2,
        kind: 'drum',
        finish: 'black',
      },
      {
        brand: 'Ludwig',
        model: 'Acoustic kits',
        note: 'The classic rock and punk sound',
        size: 2,
        kind: 'drum',
        finish: 'silver',
      },
      {
        brand: 'Zildjian',
        model: 'Cymbals',
        note: 'Crashes, rides and hats across every kit',
        size: 2,
        kind: 'cymbals',
      },
      {
        brand: 'Alesis',
        model: 'Electronic drums',
        note: 'Quiet practice and MIDI programming at home',
        size: 2,
        kind: 'drum-module',
      },
    ],
  },
];
