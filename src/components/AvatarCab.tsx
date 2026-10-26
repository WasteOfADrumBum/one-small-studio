import { useId } from 'react';
import classes from './AvatarCab.module.css';

/*
 * An Avatar 2x12 cabinet seen straight on, from photos of the real one: white tolex on a mitred
 * front frame, black corner protectors, and black grille cloth with the script logo top left and
 * the two speakers faintly showing through.
 */

/** A black plastic corner cap, drawn for the top-left corner and rotated into the others. */
const CORNER =
  'M0 8 Q0 0 8 0 H40 Q46 0 46 6 V12 Q46 16 42 16 H22 Q16 16 16 22 V42 Q16 46 12 46 H6 Q0 46 0 40 Z';

export function AvatarCab() {
  const id = useId();
  const tolex = `${id}tolex`;
  const weave = `${id}weave`;
  const cone = `${id}cone`;

  return (
    <svg
      className={classes.cab}
      viewBox="0 0 600 400"
      role="img"
      aria-label="Avatar 2x12 speaker cabinet"
    >
      <defs>
        {/* Textured white tolex: a light grain over a soft top-to-bottom shade. */}
        <pattern id={tolex} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#ecebe5" />
          <circle cx="1.5" cy="1.5" r="0.9" fill="#d9d8d1" />
          <circle cx="4.5" cy="4" r="0.7" fill="#f7f6f1" />
        </pattern>
        {/* Black grille cloth with a fine crosshatch weave. */}
        <pattern id={weave} width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="#0d0d0f" />
          <path d="M0 0 L5 5 M5 0 L0 5" stroke="#34353a" strokeWidth="0.9" />
        </pattern>
        <radialGradient id={cone}>
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0.15" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0.4" />
          <stop offset="0.86" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.95" stopColor="#000" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The front frame: each mitred side lit a little differently. */}
      <rect width="600" height="400" rx="8" fill={`url(#${tolex})`} />
      <path d="M0 0 H600 L552 48 H48 Z" className={classes.lit} />
      <path d="M0 0 L48 48 V352 L0 400 Z" className={classes.side} />
      <path d="M600 0 V400 L552 352 V48 Z" className={classes.shade} />
      <path d="M0 400 L48 352 H552 L600 400 Z" className={classes.under} />
      <path
        d="M0 0 L48 48 M600 0 L552 48 M0 400 L48 352 M600 400 L552 352"
        className={classes.mitre}
      />

      {/* The grille, set into a white trim with the speakers ghosting through. */}
      <rect x="48" y="48" width="504" height="304" className={classes.trim} />
      <rect x="54" y="54" width="492" height="292" fill={`url(#${weave})`} />
      <circle cx="178" cy="204" r="122" fill={`url(#${cone})`} />
      <circle cx="422" cy="204" r="122" fill={`url(#${cone})`} />
      <rect x="54" y="54" width="492" height="292" className={classes.recess} />
      <text x="80" y="104" className={classes.logo}>
        Avatar
      </text>

      {[0, 90, 180, 270].map((deg) => (
        <path
          key={deg}
          d={CORNER}
          className={classes.corner}
          transform={`translate(${deg === 90 || deg === 180 ? 600 : 0} ${deg >= 180 ? 400 : 0}) rotate(${deg})`}
        />
      ))}
    </svg>
  );
}
