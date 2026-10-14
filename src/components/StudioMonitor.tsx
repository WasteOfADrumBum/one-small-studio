import type { ReactNode } from 'react';
import { Led } from './hardware/Led';
import classes from './StudioMonitor.module.css';

/**
 * A widescreen studio monitor: slim bezel, a chin with its power lamp, and a stand that meets the
 * desk with a soft shadow. Whatever is passed in is the live screen content.
 */
export function StudioMonitor({ children }: { children: ReactNode }) {
  return (
    <div className={classes.monitor}>
      <div className={classes.bezel}>
        <div className={classes.screen}>{children}</div>
        <div className={classes.chin} aria-hidden="true">
          <span className={classes.badge}>OSS</span>
          <Led on color="green" className={classes.power} />
        </div>
      </div>
      <div className={classes.stand} aria-hidden="true">
        <span className={classes.neck} />
        <span className={classes.base} />
      </div>
    </div>
  );
}
