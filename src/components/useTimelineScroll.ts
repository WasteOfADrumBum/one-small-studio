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
  /** The whole session fits on screen: the playhead moves and the session stays put. */
  fit: boolean;
  /** The playhead is being dragged along the ruler or lanes. */
  scrubbing: boolean;
};

type Options = {
  /** The playhead: fixed while the session scrolls, or moving over a session that fits. */
  playhead: RefObject<HTMLElement | null>;
  /** Event elements in chronological order; their left edge is where each event starts. */
  events: () => (HTMLElement | null)[];
  /** The ruler's year cells, one per year from `startYear`. */
  ruler: RefObject<HTMLElement | null>;
  startYear: number;
  reduceMotion: boolean;
};

const DRAG_THRESHOLD = 6;

/**
 * Timeline transport, in two modes.
 *
 * When the session is wider than the screen it scrolls under a fixed playhead, and the scroll
 * container's `scrollLeft` is the only source of truth: the wheel, trackpad, touch and drag move
 * it; Earlier/Later move it to the previous or next event, lined up on the playhead; and the
 * playhead year, the current event and the button states are read back from it on every scroll,
 * resize and content change, so nothing can drift apart.
 *
 * When the whole session fits, nothing scrolls: the playhead moves instead. Its year is the source
 * of truth; Earlier/Later and selecting a clip move it to an event, and dragging along the ruler or
 * lanes (or clicking an empty spot) scrubs it.
 *
 * Both modes work in content pixels: the "position" is `scrollLeft` when scrolling and the
 * playhead's x when it fits, and each event's target is the position that puts it on the playhead.
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
    fit: false,
    scrubbing: false,
  });
  // While a smooth scroll is in flight, the next click goes from where it is heading.
  const heading = useRef<number | null>(null);
  // The event the buttons last went to, and the position that put it on the playhead. Events
  // that start in the same year share a position, so this keeps them in order.
  const cursor = useRef<{ index: number; at: number } | null>(null);
  // The playhead's year while the session fits.
  const fitYear = useRef(startYear);
  const scrubbing = useRef(false);

  /** Where everything sits, in the scroll content's coordinates. */
  const measure = () => {
    const el = ref.current;
    const head = playhead.current;
    const scale = ruler.current;
    if (!el || !head || !scale || !scale.children.length) return null;
    const cells = scale.children;
    const box = el.getBoundingClientRect();
    const toContent = (x: number) => x - box.left - el.clientLeft + el.scrollLeft;
    const fit = el.scrollWidth <= el.clientWidth + 1;
    const line = head.getBoundingClientRect();
    const first = (cells[0] as HTMLElement).getBoundingClientRect();
    const origin = toContent(first.left);
    const yearPx = first.width || 1;
    const starts = events().map((e) => (e ? toContent(e.getBoundingClientRect().left) : 0));
    // Scrolling, the playhead's centre line is the anchor every event lines up with.
    const anchor = fit ? 0 : line.left + line.width / 2 - box.left - el.clientLeft;
    return {
      el,
      fit,
      anchor,
      origin,
      yearPx,
      years: cells.length,
      toContent,
      max: el.scrollWidth - el.clientWidth,
      targets: starts.map((x) => Math.round(x - anchor)),
      position: fit ? Math.round(origin + (fitYear.current - startYear) * yearPx) : el.scrollLeft,
    };
  };

  /** The event the playhead is on, or has most recently passed. */
  const currentIndex = (at: number, targets: number[]) => {
    const c = cursor.current;
    if (c && Math.abs(c.at - at) <= 2) return c.index;
    let found = -1;
    for (let i = 0; i < targets.length; i++) {
      // The first of any events sharing a start year.
      if (targets[i] <= at + 2 && (found === -1 || targets[i] > targets[found])) found = i;
    }
    return found;
  };

  const sync = () => {
    const m = measure();
    if (!m) return;
    const at = m.position;
    if (heading.current !== null && Math.abs(heading.current - at) < 2) heading.current = null;
    const index = currentIndex(heading.current ?? at, m.targets);
    const exact = index >= 0 && Math.abs(m.targets[index] - (heading.current ?? at)) <= 2;
    const yearAt = (x: number) => startYear + (x - m.origin) / m.yearPx;
    const year = m.fit ? fitYear.current : yearAt(at + m.anchor);
    setPosition({
      year,
      index,
      canEarlier: index > 0 || (index === 0 && !exact),
      canLater: index < m.targets.length - 1,
      from: m.fit ? startYear : Math.max(startYear, Math.floor(year)),
      to: m.fit ? startYear + m.years - 1 : Math.floor(yearAt(at + m.el.clientWidth - 1)),
      fit: m.fit,
      scrubbing: scrubbing.current,
    });
  };

  /** Puts event `index` on the playhead. */
  const moveTo = (index: number, m: NonNullable<ReturnType<typeof measure>>) => {
    if (m.fit) {
      cursor.current = { index, at: m.targets[index] };
      fitYear.current = startYear + (m.targets[index] - m.origin) / m.yearPx;
    } else {
      const left = Math.max(0, Math.min(m.max, m.targets[index]));
      cursor.current = { index, at: left };
      heading.current = reduceMotion || left === Math.round(m.el.scrollLeft) ? null : left;
      m.el.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    sync();
  };

  /** Moves to the previous or next event and returns its index, or null at either end. */
  const go = (direction: -1 | 1) => {
    const m = measure();
    if (!m) return null;
    const from = heading.current ?? m.position;
    const index = currentIndex(from, m.targets);
    const exact = index >= 0 && Math.abs(m.targets[index] - from) <= 2;
    // Between events, Earlier first goes back to the one the playhead has just passed.
    const next = direction > 0 ? index + 1 : exact ? index - 1 : index;
    if (next < 0 || next >= m.targets.length) return null;
    moveTo(next, m);
    return next;
  };

  /** When the session fits, moves the playhead to event `index`; scrolling, it stays put. */
  const seek = (index: number) => {
    const m = measure();
    if (m?.fit) moveTo(index, m);
  };

  // The listeners below live as long as the element; they always call the latest functions.
  const latest = useRef({ sync, measure });
  useEffect(() => {
    latest.current = { sync, measure };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => latest.current.sync());
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

    // Scrubbing, while the session fits: drag anywhere along the ruler or lanes, or click an empty
    // spot, and the playhead follows the pointer.
    let press: { x: number; moved: boolean; onClip: boolean } | null = null;
    const scrubTo = (clientX: number) => {
      const m = latest.current.measure();
      if (!m?.fit) return;
      const x = m.toContent(clientX);
      const year = startYear + (x - m.origin) / m.yearPx;
      fitYear.current = Math.max(startYear, Math.min(startYear + m.years, year));
      cursor.current = null;
      latest.current.sync();
    };
    const onPointerDown = (e: PointerEvent) => {
      release();
      if (e.button !== 0) return;
      const target = e.target as Element;
      // The track headers are labels, not part of the timeline.
      if (target.closest('[data-track-head]')) return;
      press = { x: e.clientX, moved: false, onClip: !!target.closest('button') };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!press) return;
      if (!press.moved && Math.abs(e.clientX - press.x) < DRAG_THRESHOLD) return;
      if (!latest.current.measure()?.fit) return;
      if (!press.moved) {
        press.moved = true;
        scrubbing.current = true;
      }
      scrubTo(e.clientX);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (press && !press.moved && !press.onClip) scrubTo(e.clientX);
      press = null;
      if (scrubbing.current) {
        scrubbing.current = false;
        latest.current.sync();
      }
    };

    el.addEventListener('scroll', schedule, { passive: true });
    el.addEventListener('scrollend', release);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('touchstart', release, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(el);
    if (el.firstElementChild) resize.observe(el.firstElementChild);
    latest.current.sync();
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', schedule);
      el.removeEventListener('scrollend', release);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('touchstart', release);
      resize.disconnect();
    };
  }, [ref, startYear]);

  return { ...position, go, seek };
}
