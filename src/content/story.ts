/**
 * The Story timeline, drawn as a DAW arrangement: each era is a region on a lane.
 *
 * Years marked `estimate` are Josh's best recollection; the site prints "c." in front of them.
 */
export type Lane = 'Drums' | 'Stage' | 'Studio' | 'Life';

export type Era = {
  lane: Lane;
  title: string;
  start: number;
  /** Exclusive end year; `null` means still going. */
  end: number | null;
  /** Shown instead of the computed range, when a region is drawn wider than its dates for legibility. */
  years?: string;
  estimate?: boolean;
  body: string;
};

export const lanes: Lane[] = ['Drums', 'Stage', 'Studio', 'Life'];

export const timelineStart = 1989;
export const timelineEnd = 2027;

export const eras: Era[] = [
  {
    lane: 'Life',
    title: 'Born',
    start: 1989,
    // Drawn two years wide so the clip has room for its name.
    end: 1991,
    years: '1989',
    body: 'Born in 1989. Everything after this is the soundtrack.',
  },
  {
    lane: 'Drums',
    title: 'First snare',
    start: 1997,
    end: 1999,
    body: 'Started on a snare drum in 1997, before there was ever a full kit in the house.',
  },
  {
    lane: 'Drums',
    title: 'First kit',
    start: 1999,
    end: null,
    estimate: true,
    body: 'Got my first drum set around 1999, and I have been behind one ever since.',
  },
  {
    lane: 'Stage',
    title: 'Playing out',
    start: 2003,
    end: 2017,
    body: 'Live shows from 2003 through 2017: rock, punk, heavy metal and ska. Toured and treated it like a profession.',
  },
  {
    lane: 'Studio',
    title: 'The Recording Workshop',
    start: 2011,
    end: 2013,
    years: '2011',
    body: 'Graduated in 2011 from the world-renowned Recording Workshop in Chillicothe, Ohio.',
  },
  {
    lane: 'Stage',
    title: 'Front of house',
    start: 2011,
    end: 2017,
    body: 'Mixed live sound for festivals and venues from 2011 through 2017, while still playing in bands.',
  },
  {
    lane: 'Studio',
    title: 'Recording and production',
    start: 2011,
    end: null,
    body: 'Tracking, mixing and producing rock, punk and metal records since 2011, and still taking on projects one at a time. The catalog below is the proof.',
  },
  {
    lane: 'Life',
    title: 'Off the road',
    start: 2017,
    end: null,
    body: 'Stopped touring in 2017. Being a present dad and a loving husband comes first now. The music is still here.',
  },
  {
    lane: 'Stage',
    title: 'Volunteer sound',
    start: 2023,
    end: 2025,
    body: 'Kept mixing live sound as a volunteer from 2023 up until last year.',
  },
];

export const yearLabel = (era: Era) =>
  era.years ??
  `${era.estimate ? 'c. ' : ''}${era.start}${era.end === null ? ' to now' : era.end - era.start > 1 ? ` to ${era.end}` : ''}`;
