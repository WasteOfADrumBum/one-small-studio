import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'oss-power';

type Power = { powered: boolean; setPowered: (on: boolean) => void };

const PowerContext = createContext<Power | null>(null);

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

/**
 * The console's power state. Turning it on is the visitor's opt-in: browsers block sound until
 * someone clicks, so the SoundCloud reel starts from this switch (or the play button), never on load.
 * Only the light show is remembered between visits; sound always waits for a click.
 */
export function PowerProvider({ children }: { children: ReactNode }) {
  const [powered, setPowered] = useState(readStored);

  const set = useCallback((on: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      // Private windows can refuse storage; the switch still works for this visit.
    }
    setPowered(on);
  }, []);

  return <PowerContext value={{ powered, setPowered: set }}>{children}</PowerContext>;
}

export function usePower(): Power {
  const power = useContext(PowerContext);
  if (!power) throw new Error('usePower must be used inside PowerProvider');
  return power;
}
