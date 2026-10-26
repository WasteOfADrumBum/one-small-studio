// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { releases } from '@/content/releases';
import { PlayerProvider, usePlayer } from './player';
import type { ScWidget } from './soundcloud';

/** A stand-in for the SoundCloud widget, so the player can be driven without the network. */
function fakeWidget() {
  const listeners: Record<string, ((e?: object) => void)[]> = {};
  const fire = (event: string, payload?: object) => listeners[event]?.forEach((f) => f(payload));
  const sounds = [1, 2, 3].map((id) => ({
    id,
    title: `Song ${id}`,
    permalink_url: '',
    artwork_url: `https://i1.sndcdn.com/art${id}-large.jpg`,
    duration: 60_000 * id,
  }));
  let index = 0;
  const widget = {
    bind: vi.fn((event: string, f: () => void) => (listeners[event] ??= []).push(f)),
    unbind: vi.fn(),
    play: vi.fn(() => fire('play')),
    pause: vi.fn(() => fire('pause')),
    toggle: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    skip: vi.fn((i: number) => {
      index = i;
      fire('play');
    }),
    load: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn((cb: (v: number) => void) => cb(64)),
    getSounds: vi.fn((cb: (s: typeof sounds) => void) => cb(sounds)),
    getCurrentSoundIndex: vi.fn((cb: (i: number) => void) => cb(index)),
  } satisfies ScWidget;
  return { widget, fire };
}

let fake: ReturnType<typeof fakeWidget>;

function Probe() {
  const p = usePlayer();
  return (
    <div>
      <span data-testid="status">{p.status}</span>
      <span data-testid="album">{p.album.id}</span>
      <span data-testid="tracks">{p.tracks.map((t) => t.title).join('|')}</span>
      <span data-testid="playing">{String(p.playing)}</span>
      <span data-testid="current">{p.current}</span>
      <span data-testid="volume">{p.volume}</span>
      <button onClick={() => p.play(2)}>skip</button>
      <button onClick={() => p.setVolume(140)}>loud</button>
      <button onClick={() => p.loadAlbum(releases[1].id, true)}>load</button>
    </div>
  );
}

const text = (id: string) => screen.getByTestId(id).textContent;

async function mount() {
  render(
    <PlayerProvider>
      <Probe />
    </PlayerProvider>,
  );
  // Let the widget API promise resolve and the provider bind its listeners.
  await act(async () => {});
}

describe('PlayerProvider', () => {
  beforeEach(() => {
    fake = fakeWidget();
    const Widget = Object.assign(() => fake.widget, {
      Events: {
        READY: 'ready',
        PLAY: 'play',
        PAUSE: 'pause',
        FINISH: 'finish',
        PLAY_PROGRESS: 'progress',
        ERROR: 'error',
      },
    });
    window.SC = { Widget };
  });
  afterEach(() => {
    cleanup();
    delete window.SC;
    vi.useRealTimers();
  });

  it('loads the first release, hidden from assistive tech, without playing it', async () => {
    await mount();
    expect(text('status')).toBe('loading');
    const frame = document.querySelector('iframe')!;
    expect(frame.getAttribute('aria-hidden')).toBe('true');
    expect(frame.tabIndex).toBe(-1);
    expect(new URL(frame.src).searchParams.get('auto_play')).toBe('false');

    act(() => fake.fire('ready'));
    expect(text('status')).toBe('ready');
    expect(text('album')).toBe(releases[0].id);
    expect(text('tracks')).toBe('Song 1|Song 2|Song 3');
    expect(text('volume')).toBe('64');
    expect(fake.widget.play).not.toHaveBeenCalled();
    expect(text('playing')).toBe('false');
  });

  it('skips to a track and follows the widget when it plays', async () => {
    await mount();
    act(() => fake.fire('ready'));
    act(() => screen.getByText('skip').click());
    expect(fake.widget.skip).toHaveBeenCalledWith(2);
    expect(text('current')).toBe('2');
    expect(text('playing')).toBe('true');
    act(() => fake.fire('pause'));
    expect(text('playing')).toBe('false');
  });

  it('keeps the volume between 0 and 100', async () => {
    await mount();
    act(() => fake.fire('ready'));
    act(() => screen.getByText('loud').click());
    expect(text('volume')).toBe('100');
    expect(fake.widget.setVolume).toHaveBeenLastCalledWith(100);
  });

  it('swaps albums, carrying the volume over and playing when asked', async () => {
    await mount();
    act(() => fake.fire('ready'));
    act(() => screen.getByText('load').click());
    expect(text('album')).toBe(releases[1].id);
    expect(text('status')).toBe('loading');
    const [url, options] = fake.widget.load.mock.calls[0];
    expect(url).toBe(releases[1].playerUrl);
    act(() => (options as { callback: () => void }).callback());
    expect(text('status')).toBe('ready');
    expect(fake.widget.setVolume).toHaveBeenCalledWith(64);
    expect(fake.widget.play).toHaveBeenCalled();
  });

  it('reports an error when an album never answers', async () => {
    await mount();
    act(() => fake.fire('ready'));
    vi.useFakeTimers();
    act(() => screen.getByText('load').click());
    act(() => vi.advanceTimersByTime(15_000));
    expect(text('status')).toBe('error');
  });

  it('reports an error when the widget does', async () => {
    await mount();
    act(() => fake.fire('error'));
    expect(text('status')).toBe('error');
  });
});
