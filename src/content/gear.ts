/**
 * The Studio gear, in three rack cabinets. The admin will take this list over in a later phase.
 *
 * `size` is the space it takes in the rack, in rack units (U). `kind` picks how it is drawn:
 * rack-mount gear gets a faceplate, everything else (amps, cabs, drums, the DAW) sits on a rack
 * shelf. Both are presentation only and say nothing about specs or ownership.
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
  /** Shell finish for drums; decorative. */
  shell?: 'black' | 'silver';
};

export type GearGroup = {
  name: string;
  items: GearItem[];
};

/** Kinds that bolt to the rails; the rest stand on a shelf. */
export const rackMounted: GearKind[] = ['interface', 'effects', 'drum-module'];

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
        size: 2,
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
        shell: 'black',
      },
      {
        brand: 'Ludwig',
        model: 'Acoustic kits',
        note: 'The classic rock and punk sound',
        size: 2,
        kind: 'drum',
        shell: 'silver',
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
