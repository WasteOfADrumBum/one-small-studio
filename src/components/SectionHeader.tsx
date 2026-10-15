import type { ReactNode } from 'react';
import classes from './SectionHeader.module.css';

type SectionHeaderProps = {
  /** "Track 02 · The story": the small engraved label above the title. */
  label: string;
  id: string;
  title: ReactNode;
  children?: ReactNode;
};

/** The shared heading block every section opens with, so type and spacing stay in step. */
export function SectionHeader({ label, id, title, children }: SectionHeaderProps) {
  return (
    <header className={classes.header}>
      <span className="label">{label}</span>
      <h2 id={id} className={classes.title}>
        {title}
      </h2>
      {children && <p className={classes.intro}>{children}</p>}
    </header>
  );
}
