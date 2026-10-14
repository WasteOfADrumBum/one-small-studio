import { memo } from 'react';
import type { Lane } from '@/content/story';

type WaveformProps = { seed: string; lane: Lane; className?: string };

const SAMPLES = 160;

/** A small deterministic random generator, so each clip keeps the same waveform between renders. */
function random(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Envelope by track: drums hit hard and decay, the stage runs hot, life sits quietly. */
function amplitude(lane: Lane, i: number, r: () => number) {
  switch (lane) {
    case 'Drums': {
      const hit = i % 6 === 0 ? 1 : i % 6 === 3 ? 0.7 : 0;
      return hit ? 0.55 + r() * 0.4 * hit : 0.12 + r() * 0.28;
    }
    case 'Stage':
      return 0.5 + r() * 0.45;
    case 'Studio':
      return 0.25 + Math.abs(Math.sin(i / 9)) * 0.45 + r() * 0.2;
    case 'Life':
      return 0.12 + Math.abs(Math.sin(i / 17)) * 0.22 + r() * 0.1;
  }
}

/**
 * Decorative waveform drawn inside a timeline clip. These clips are history, not audio, so the
 * waveform is texture only: hidden from assistive tech and never playable.
 */
export const Waveform = memo(function Waveform({ seed, lane, className }: WaveformProps) {
  const r = random(seed);
  const amps = Array.from({ length: SAMPLES }, (_, i) => {
    const fade = Math.min(1, i / 4, (SAMPLES - i) / 4);
    return Math.min(1, amplitude(lane, i, r)) * fade;
  });
  const top = amps.map((a, i) => `${i},${(50 - a * 46).toFixed(1)}`).join(' L');
  const bottom = amps
    .map((a, i) => `${i},${(50 + a * 46).toFixed(1)}`)
    .reverse()
    .join(' L');
  return (
    <svg
      className={className}
      viewBox={`0 0 ${SAMPLES - 1} 100`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={`M${top} L${bottom} Z`} />
      <line x1="0" y1="50" x2={SAMPLES - 1} y2="50" />
    </svg>
  );
});
