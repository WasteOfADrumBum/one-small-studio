import { useEffect, useRef, useState, type RefObject } from 'react';

type Position = {
  /** Year under the playhead, as a fraction (2004.5 is halfway through 2004). */
  year: number;
  /** The event the playhead is on or has most recently passed; -1 before the first. */
  index: number;
  canEarlier: boolean;
  canLater: boolean;
  /** First and last whole years in view. */
  from: number;
  to: number;
};

type Options = {
  /** The fixed playhead: the anchor every event lines up with. */
  playhead: RefObject<HTMLElement | null>;
  /** Event elements in chronological order; their left edge is where each event starts. */
  events: () => (HTMLElement | null)[];
  /** The ruler's year cells, one per year from `startYear`. */
  ruler: RefObject<HTMLElement | null>;
  startYear: number;
  reduceMotion: boolean;
};

/**
 * Timeline transport. The scroll container's `scrollLeft` is the only source of truth: the wheel,
 * trackpad, touch and drag move it; Earlier/Later move it to the previous or next event, lined up
 * on the playhead; and the playhead position, the current event and the button states are all
 * read back from it on every scroll, resize and content change, so nothing can drift apart.
 */
export function useTimelineScroll(
  ref: RefObject<HTMLElement | null>,
  { playhead, events, ruler, startYear, reduceMotion }: Options,
) {
  const [position, setPosition] = useState<Position>({
    year: startYear,
    index: 0,
    canEarlier: false,
    canLater: true,
    from: startYear,
    to: startYear,
  });
  // While a smooth scroll is in flight, the next click goes from where it is heading.
  const heading = useRef<number | null>(null);
  // The event the buttons last went to, and the scroll position that put it on the playhead.
  // Events that start in the same year share a position, so this keeps them in order.
  const cursor = useRef<{ index: number; left: number } | null>(null);

  /** Where everything sits, in the scroll content's coordinates. */
  const measure = () => {
    const el = ref.current;
    const head = playhead.current;
    const scale = ruler.current;
    if (!el || !head || !scale || !scale.children.length) return null;
    const cells = scale.children;
    const box = el.getBoundingClientRect();
    const toContent = (x: number) => x - box.left - el.clientLeft + el.scrollLeft;
    const line = head.getBoundingClientRect();
    // The playhead's centre line is the anchor.
    const anchor = line.left + line.width / 2 - box.left - el.clientLeft;
    const first = (cells[0] as HTMLElement).getBoundingClientRect();
    const starts = events().map((e) => (e ? toContent(e.getBoundingClientRect().left) : 0));
    return {
      el,
      anchor,
      max: el.scrollWidth - el.clientWidth,
      origin: toContent(first.left),
      yearPx: first.width || 1,
      // An event's scroll position is the one that puts its start on the playhead.
      targets: starts.map((x) => Math.round(x - anchor)),
    };
  };

  /** The event the playhead is on, or has most recently passed. */
  const currentIndex = (left: number, targets: number[]) => {
    const c = cursor.current;
    if (c && Math.abs(c.left - left) <= 2) return c.index;
    let found = -1;
    for (let i = 0; i < targets.length; i++) {
      // The first of any events sharing a start year.
      if (targets[i] <= left + 2 && (found === -1 || targets[i] > targets[found])) found = i;
    }
    return found;
  };

  const sync = () => {
    const m = measure();
    if (!m) return;
    const left = m.el.scrollLeft;
    if (heading.current !== null && Math.abs(heading.current - left) < 2) heading.current = null;
    const index = currentIndex(heading.current ?? left, m.targets);
    const exact = index >= 0 && Math.abs(m.targets[index] - (heading.current ?? left)) <= 2;
    const yearAt = (x: number) => startYear + (x - m.origin) / m.yearPx;
    setPosition({
      year: yearAt(left + m.anchor),
      index,
      canEarlier: index > 0 || (index === 0 && !exact),
      canLater: index < m.targets.length - 1,
      from: Math.max(startYear, Math.floor(yearAt(left + m.anchor))),
      to: Math.floor(yearAt(left + m.el.clientWidth - 1)),
    });
  };

  /** Moves to the previous or next event and returns its index, or null at either end. */
  const go = (direction: -1 | 1) => {
    const m = measure();
    if (!m) return null;
    const from = heading.current ?? m.el.scrollLeft;
    const index = currentIndex(from, m.targets);
    const exact = index >= 0 && Math.abs(m.targets[index] - from) <= 2;
    // Between events, Earlier first goes back to the one the playhead has just passed.
    const next = direction > 0 ? index + 1 : exact ? index - 1 : index;
    if (next < 0 || next >= m.targets.length) return null;
    const left = Math.max(0, Math.min(m.max, m.targets[next]));
    cursor.current = { index: next, left };
    heading.current = reduceMotion || left === Math.round(m.el.scrollLeft) ? null : left;
    m.el.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    sync();
    return next;
  };

  // The listeners below live as long as the element; they always call the latest sync.
  const latestSync = useRef(sync);
  useEffect(() => {
    latestSync.current = sync;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => latestSync.current());
    };
    // Hands-on scrolling cancels a pending button target.
    const release = () => {
      heading.current = null;
    };

    // Vertical wheel turns into sideways movement while the timeline can still move that way; at
    // either end it is left alone so the page keeps scrolling. Horizontal wheel and trackpad
    // gestures are native and never touched, so nothing is applied twice.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        release();
        return;
      }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
      const delta = e.deltaY * unit;
      const max = el.scrollWidth - el.clientWidth;
      const base = heading.current ?? el.scrollLeft;
      const canMove = delta > 0 ? base < max - 1 : base > 1;
      if (!canMove) return;
      e.preventDefault();
      heading.current = null;
      el.scrollLeft = Math.max(0, Math.min(max, base + delta));
    };

    el.addEventListener('scroll', schedule, { passive: true });
    el.addEventListener('scrollend', release);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', release);
    el.addEventListener('touchstart', release, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(el);
    if (el.firstElementChild) resize.observe(el.firstElementChild);
    latestSync.current();
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', schedule);
      el.removeEventListener('scrollend', release);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', release);
      el.removeEventListener('touchstart', release);
      resize.disconnect();
    };
  }, [ref]);

  return { ...position, go };
}
