import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'oss-power';

type Power = { powered: boolean; toggle: () => void };

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
 * someone clicks, so the background reel (phase three) starts from this switch, never on load.
 */
export function PowerProvider({ children }: { children: ReactNode }) {
  const [powered, setPowered] = useState(readStored);

  const toggle = useCallback(() => {
    setPowered((on) => {
      try {
        localStorage.setItem(STORAGE_KEY, on ? 'off' : 'on');
      } catch {
        // Private windows can refuse storage; the switch still works for this visit.
      }
      return !on;
    });
  }, []);

  return <PowerContext value={{ powered, toggle }}>{children}</PowerContext>;
}

export function usePower(): Power {
  const power = useContext(PowerContext);
  if (!power) throw new Error('usePower must be used inside PowerProvider');
  return power;
}
