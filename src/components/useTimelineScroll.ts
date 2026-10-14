import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** How much of a visible page Earlier/Later moves, leaving the rest on screen for context. */
const PAGE = 0.8;

type Range = { canEarlier: boolean; canLater: boolean; from: number; to: number };

/**
 * Sideways scrolling for the timeline. The scroll container's `scrollLeft` is the only source of
 * truth: Earlier/Later page from it, the wheel feeds it, and the button states are read back from
 * it on every scroll, resize and content change.
 *
 * `headWidth` is the width of the sticky track headers, which cover the left of the scrollport,
 * so a "page" is the visible lane area only.
 */
export function useTimelineScroll(
  ref: RefObject<HTMLElement | null>,
  headWidth: () => number,
  reduceMotion: boolean,
) {
  const [range, setRange] = useState<Range>({ canEarlier: false, canLater: true, from: 0, to: 1 });
  // While a smooth scroll is in flight, the next click pages from where it is heading, not from
  // wherever the animation happens to be, so Later then Earlier lands back exactly.
  const heading = useRef<number | null>(null);
  // The last button page. A page that hit the end is shorter than a full one, so the opposite
  // button retraces it exactly instead of paging a full width back from the end.
  const last = useRef<{ from: number; to: number; direction: -1 | 1 } | null>(null);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setRange({
      canEarlier: left > 1,
      canLater: left < max - 1,
      from: el.scrollWidth ? left / el.scrollWidth : 0,
      to: el.scrollWidth ? (left + el.clientWidth) / el.scrollWidth : 1,
    });
    if (heading.current !== null && Math.abs(heading.current - left) < 2) heading.current = null;
  }, [ref]);

  const page = useCallback(
    (direction: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      const visible = Math.max(80, el.clientWidth - headWidth());
      const from = heading.current ?? el.scrollLeft;
      const back = last.current;
      const target =
        back && back.direction === -direction && Math.abs(back.to - from) < 2
          ? Math.max(0, Math.min(max, back.from))
          : Math.round(Math.max(0, Math.min(max, from + direction * visible * PAGE)));
      last.current = { from, to: target, direction };
      heading.current = reduceMotion ? null : target;
      el.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    [ref, headWidth, reduceMotion],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Any hands-on scrolling cancels a pending button target.
    const release = () => {
      heading.current = null;
    };

    // Vertical wheel turns into sideways movement while the timeline can still move that way;
    // at either end it is left alone so the page keeps scrolling. Horizontal wheel and trackpad
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

    el.addEventListener('scroll', sync, { passive: true });
    el.addEventListener('scrollend', release);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', release);
    el.addEventListener('touchstart', release, { passive: true });
    const resize = new ResizeObserver(sync);
    resize.observe(el);
    if (el.firstElementChild) resize.observe(el.firstElementChild);
    sync();
    return () => {
      el.removeEventListener('scroll', sync);
      el.removeEventListener('scrollend', release);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', release);
      el.removeEventListener('touchstart', release);
      resize.disconnect();
    };
  }, [ref, sync]);

  return { ...range, page };
}
