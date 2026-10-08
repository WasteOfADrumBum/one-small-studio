/**
 * The Story timeline, drawn as a DAW arrangement: each era is a region on a lane.
 *
 * Years marked `estimate` are placeholders until Josh confirms them; the copy says "around" for those
 * and the admin will take over this list in a later phase.
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

export const timelineStart = 1994;
export const timelineEnd = 2027;

export const eras: Era[] = [
  {
    lane: 'Drums',
    title: 'First sticks',
    start: 1994,
    end: null,
    estimate: true,
    body: 'Started on drums as a kid. More than thirty years behind the kit, and still counting.',
  },
  {
    lane: 'Stage',
    title: 'Playing out',
    start: 2004,
    end: 2017,
    estimate: true,
    body: 'Live shows from 2004 on: rock, punk, heavy metal and ska. Toured and treated it like a profession.',
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
    estimate: true,
    body: 'Several years mixing live sound for festivals and venues, while still playing in bands.',
  },
  {
    lane: 'Studio',
    title: 'Recording and production',
    start: 2013,
    end: null,
    estimate: true,
    body: 'Tracking, mixing and producing rock, punk and metal records. The catalog below is the proof.',
  },
  {
    lane: 'Life',
    title: 'Off the road',
    start: 2017,
    end: null,
    estimate: true,
    body: 'No more tours and no band. Being a present dad and a loving husband comes first now. The music is still here.',
  },
];

export const yearLabel = (era: Era) =>
  era.years ??
  `${era.estimate ? 'c. ' : ''}${era.start}${era.end === null ? ' to now' : era.end - era.start > 1 ? ` to ${era.end}` : ''}`;
