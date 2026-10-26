import type { ReactNode } from 'react';
import { Screw } from './hardware/Screw';
import classes from './StudioMonitor.module.css';

type StudioMonitorProps = {
  children: ReactNode;
  /** Shown in the recessed display on the front of the desk unit the monitor stands on. */
  notes: ReactNode;
};

/**
 * Josh's Sceptre curved monitor on its tripod stand, standing on a shallow black desk unit whose
 * front display carries the session notes. On wide screens it is the 49" 32:9 super ultrawide; on
 * tablets and phones, the 32" 16:9. `children` is the live screen content.
 */
export function StudioMonitor({ children, notes }: StudioMonitorProps) {
  return (
    <div className={classes.monitor}>
      <div className={classes.panel}>
        <div className={classes.bezel}>
          <div className={classes.screen}>{children}</div>
        </div>
        <div className={classes.chin} aria-hidden="true">
          <span className={classes.logo}>Sceptre</span>
          <span className={classes.power} />
        </div>
      </div>
      <TripodStand />
      <div className={classes.unit}>
        <span className={classes.top} aria-hidden="true" />
        <div className={classes.front}>
          <Screw className={classes.fastener} size={8} turn={20} />
          <div className={classes.display}>{notes}</div>
          <Screw className={classes.fastener} size={8} turn={-30} />
        </div>
      </div>
    </div>
  );
}

/**
 * The Sceptre tripod, seen from the front: a gunmetal column with a red ring above the hub, two
 * legs splayed forward and out, and a short one running back.
 */
function TripodStand() {
  return (
    <svg className={classes.stand} viewBox="0 0 600 180" aria-hidden="true">
      <defs>
        <linearGradient id="sceptre-column" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2c2e32" />
          <stop offset="0.32" stopColor="#7a7e85" />
          <stop offset="0.55" stopColor="#56595f" />
          <stop offset="1" stopColor="#25272a" />
        </linearGradient>
        <linearGradient id="sceptre-leg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6c7076" />
          <stop offset="0.45" stopColor="#4a4d53" />
          <stop offset="1" stopColor="#2a2c30" />
        </linearGradient>
        <linearGradient id="sceptre-ring" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#6e0a19" />
          <stop offset="0.35" stopColor="#ff4d64" />
          <stop offset="0.6" stopColor="#c8102e" />
          <stop offset="1" stopColor="#5a0814" />
        </linearGradient>
        <filter id="sceptre-glow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Contact shadows on the desk unit under each foot. */}
      <g fill="rgb(0 0 0 / 0.75)" filter="url(#sceptre-glow)">
        <ellipse cx="22" cy="170" rx="22" ry="4" />
        <ellipse cx="578" cy="170" rx="22" ry="4" />
        <ellipse cx="300" cy="134" rx="12" ry="3" />
      </g>

      {/* The back leg, short from the front because it runs away from the viewer. */}
      <rect x="296" y="112" width="8" height="20" rx="3" fill="url(#sceptre-leg)" />

      {/* The two front legs, splayed out toward the viewer. */}
      <g strokeLinecap="round">
        <path d="M296 114 L22 166" stroke="url(#sceptre-leg)" strokeWidth="8" />
        <path d="M304 114 L578 166" stroke="url(#sceptre-leg)" strokeWidth="8" />
        <path
          d="M294 111 L24 162 M306 111 L576 162"
          stroke="rgb(255 255 255 / 0.22)"
          strokeWidth="1.4"
        />
      </g>
      <g fill="#18191c">
        <rect x="8" y="162" width="26" height="7" rx="3.5" />
        <rect x="566" y="162" width="26" height="7" rx="3.5" />
      </g>

      {/* Column, red ring and hub. */}
      <rect x="284" y="0" width="32" height="104" fill="url(#sceptre-column)" />
      <rect
        x="282"
        y="94"
        width="36"
        height="9"
        rx="1.5"
        fill="#c8102e"
        opacity="0.6"
        filter="url(#sceptre-glow)"
      />
      <rect x="283" y="95" width="34" height="7" rx="1.5" fill="url(#sceptre-ring)" />
      <path d="M284 102 H316 L313 118 Q300 122 287 118 Z" fill="url(#sceptre-column)" />
    </svg>
  );
}
