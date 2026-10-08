/** The Studio gear rack. One entry per rack unit; the admin will take this over in a later phase. */
export type GearGroup = {
  name: string;
  items: { brand: string; model: string; note: string }[];
};

export const gear: GearGroup[] = [
  {
    name: 'Recording',
    items: [
      {
        brand: 'Avid',
        model: 'Pro Tools',
        note: 'Where every session gets tracked, edited and mixed',
      },
      { brand: 'Focusrite', model: 'Preamps', note: 'Clean, quiet front end for drums and vocals' },
    ],
  },
  {
    name: 'Amps and effects',
    items: [
      {
        brand: 'Carvin',
        model: 'V3M',
        note: 'The go-to head, plus a lot of other Carvin amps over the years',
      },
      { brand: 'Avatar', model: 'Cabinets', note: 'Speaker cabs behind the Carvins' },
      {
        brand: 'Boss',
        model: 'Effects',
        note: 'Pedals for everything from ska upstrokes to metal',
      },
    ],
  },
  {
    name: 'Drums',
    items: [
      { brand: 'Pearl', model: 'Acoustic kits', note: 'Live and studio workhorse' },
      { brand: 'Ludwig', model: 'Acoustic kits', note: 'The classic rock and punk sound' },
      { brand: 'Zildjian', model: 'Cymbals', note: 'Crashes, rides and hats across every kit' },
      {
        brand: 'Alesis',
        model: 'Electronic drums',
        note: 'Quiet practice and MIDI programming at home',
      },
    ],
  },
];
