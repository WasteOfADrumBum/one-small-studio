/**
 * The Studio gear, in two rack cabinets. The admin will take this list over in a later phase.
 *
 * Every item is drawn as a rack-mounted module, whatever it really is. `size` is its height in rack
 * units (U) and `kind` picks the faceplate style that suggests its category. Real rack gear (the
 * Carvin, the Focusrite pair, the Boss) is drawn as itself under a 1U nameplate, and its `size`
 * counts both. Both are presentation only.
 */
export type RackSize = 1 | 2 | 3 | 4 | 5;

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
  /** The power conditioner on top of the rack, which also works its power and lights. */
  power: 'furman' | 'livewire';
  items: GearItem[];
};

export const gear: GearGroup[] = [
  {
    name: 'Recording and drums',
    power: 'furman',
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
  {
    name: 'Amps and effects',
    power: 'livewire',
    // In the order of the real guitar rack, top to bottom.
    items: [
      {
        brand: 'Boss',
        model: 'Effects',
        note: 'Pedals for everything from ska upstrokes to metal',
        size: 3,
        kind: 'effects',
      },
      {
        brand: 'Carvin',
        model: 'V3M',
        note: 'The go-to head, plus a lot of other Carvin amps over the years',
        size: 5,
        kind: 'amp-head',
      },
      {
        brand: 'Avatar',
        model: 'Cabinets',
        note: 'Speaker cabs behind the Carvins',
        size: 1,
        kind: 'speaker-cab',
      },
    ],
  },
];
