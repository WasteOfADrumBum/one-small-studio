import type { ReactNode } from 'react';
import { Led } from './hardware/Led';
import { Screw } from './hardware/Screw';
import classes from './StudioMonitor.module.css';

type StudioMonitorProps = {
  children: ReactNode;
  /** Shown in the recessed display on the front of the desk unit the monitor stands on. */
  notes: ReactNode;
};

/**
 * A widescreen studio monitor on its stand, standing on a shallow black desk unit whose front
 * display carries the session notes. `children` is the live screen content.
 */
export function StudioMonitor({ children, notes }: StudioMonitorProps) {
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
        <span className={classes.foot} />
      </div>
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
