import { describe, expect, it } from 'vitest';
import { artwork, formatTime, widgetSrc, type ScSound } from './soundcloud';

const sound = (over: Partial<ScSound>): ScSound => ({
  id: 1,
  title: 'Song',
  permalink_url: '',
  artwork_url: null,
  duration: 0,
  ...over,
});

describe('soundcloud helpers', () => {
  it('formats milliseconds as m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65_400)).toBe('1:05');
    expect(formatTime(38 * 60_000 + 39_000)).toBe('38:39');
  });

  it('asks for 500px art, falling back to the uploader avatar', () => {
    expect(artwork(sound({ artwork_url: 'https://i1.sndcdn.com/a-large.jpg' }))).toBe(
      'https://i1.sndcdn.com/a-t500x500.jpg',
    );
    expect(artwork(sound({ user: { username: 'j', avatar_url: 'https://x/u-large.jpg' } }))).toBe(
      'https://x/u-t500x500.jpg',
    );
    expect(artwork(sound({}))).toBeNull();
  });

  it('never autoplays the hidden widget', () => {
    const src = new URL(widgetSrc('https://api.soundcloud.com/playlists/1?secret_token=s-x'));
    expect(src.origin).toBe('https://w.soundcloud.com');
    expect(src.searchParams.get('auto_play')).toBe('false');
    expect(src.searchParams.get('url')).toBe(
      'https://api.soundcloud.com/playlists/1?secret_token=s-x',
    );
  });
});
