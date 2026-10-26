import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'oss-motion';

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'paused';
  } catch {
    return false;
  }
}

/**
 * The visitor's switch for the page's looping animations (spinning fans, scrolling screens,
 * breathing lights). Paused, every CSS animation holds where it is; the OS reduced-motion setting
 * still stops them before they start. Remembered between visits.
 */
export function useMotionPause() {
  const [paused, setPausedState] = useState(readStored);

  useEffect(() => {
    if (paused) document.documentElement.dataset.motion = 'paused';
    else delete document.documentElement.dataset.motion;
  }, [paused]);

  const setPaused = useCallback((next: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'paused' : 'on');
    } catch {
      // Private windows can refuse storage; the switch still works for this visit.
    }
    setPausedState(next);
  }, []);

  return [paused, setPaused] as const;
}
