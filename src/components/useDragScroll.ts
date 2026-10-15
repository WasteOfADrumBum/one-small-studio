import { useCallback, useRef, useState, type PointerEvent, type RefObject } from 'react';

const THRESHOLD = 6;

/**
 * Click-and-drag sideways scrolling for a mouse, on top of the native scrollbar, wheel, keyboard and
 * touch scrolling the element already has. `moved()` tells a click handler to ignore the click that
 * ends a drag.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  const start = useRef<{ x: number; left: number; id: number } | null>(null);
  const didMove = useRef(false);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return;
      start.current = { x: e.clientX, left: ref.current.scrollLeft, id: e.pointerId };
      didMove.current = false;
    },
    [ref],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const s = start.current;
      const el = ref.current;
      if (!s || !el) return;
      const dx = e.clientX - s.x;
      if (!didMove.current && Math.abs(dx) < THRESHOLD) return;
      if (!didMove.current) {
        didMove.current = true;
        setDragging(true);
        el.setPointerCapture(s.id);
      }
      el.scrollLeft = s.left - dx;
    },
    [ref],
  );

  const end = useCallback(() => {
    start.current = null;
    setDragging(false);
  }, []);

  return {
    dragging,
    moved: () => didMove.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end },
  };
}
