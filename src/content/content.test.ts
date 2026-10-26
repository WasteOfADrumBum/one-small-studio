import { describe, expect, it } from 'vitest';
import { gear } from './gear';
import { releases } from './releases';
import { eras, lanes, timelineEnd, timelineStart, yearLabel, type Era } from './story';

describe('releases', () => {
  it('have unique ids', () => {
    const ids = releases.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Private sets only play by API URL with their secret token; a page link silently fails.
  it.each(releases.map((r) => [r.title, r] as const))('%s loads by SoundCloud API URL', (_, r) => {
    expect(r.playerUrl).toMatch(
      /^https:\/\/api\.soundcloud\.com\/playlists\/soundcloud:playlists:\d+\?secret_token=s-\w+$/,
    );
    expect(r.pageUrl).toMatch(/^https:\/\/soundcloud\.com\//);
    const token = new URL(r.playerUrl).searchParams.get('secret_token');
    expect(r.pageUrl.endsWith(`/${token}`)).toBe(true);
  });
});

describe('story timeline', () => {
  it('keeps every era on a known lane and inside the timeline', () => {
    for (const era of eras) {
      expect(lanes).toContain(era.lane);
      expect(era.start).toBeGreaterThanOrEqual(timelineStart);
      expect(era.end ?? timelineEnd).toBeLessThanOrEqual(timelineEnd);
      expect(era.end ?? timelineEnd).toBeGreaterThan(era.start);
    }
  });

  it('has unique titles, which the clips use as keys', () => {
    const titles = eras.map((e) => e.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('reaches the current year', () => {
    expect(timelineEnd).toBeGreaterThan(new Date().getFullYear());
  });

  it('labels years', () => {
    const era = (over: Partial<Era>): Era => ({
      lane: 'Drums',
      title: 't',
      start: 2004,
      end: null,
      body: '',
      ...over,
    });
    expect(yearLabel(era({}))).toBe('2004 to now');
    expect(yearLabel(era({ estimate: true }))).toBe('c. 2004 to now');
    expect(yearLabel(era({ end: 2017 }))).toBe('2004 to 2017');
    expect(yearLabel(era({ end: 2005 }))).toBe('2004');
    expect(yearLabel(era({ years: '2011' }))).toBe('2011');
  });
});

describe('gear', () => {
  it('has two racks, each item a whole number of rack units', () => {
    expect(gear).toHaveLength(2);
    for (const item of gear.flatMap((g) => g.items)) {
      expect(Number.isInteger(item.size)).toBe(true);
      expect(item.size).toBeGreaterThan(0);
    }
  });
});
