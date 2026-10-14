import classes from './RecordSleeve.module.css';

type RecordSleeveProps = {
  title: string;
  artwork: string | null;
  selected: boolean;
  spinning: boolean;
  /** Small turn so a row of sleeves looks placed by hand. */
  tilt: number;
  onSelect: () => void;
  describedBy: string;
};

/**
 * A record sleeve standing on the ledge. Selecting it slides the record partway out; while its
 * album plays the record turns. The sleeve is a display metaphor, not a claim of a vinyl pressing.
 */
export function RecordSleeve({
  title,
  artwork,
  selected,
  spinning,
  tilt,
  onSelect,
  describedBy,
}: RecordSleeveProps) {
  return (
    <button
      type="button"
      className={classes.sleeve}
      aria-pressed={selected}
      aria-describedby={describedBy}
      onClick={onSelect}
      style={{ rotate: `${tilt}deg` }}
    >
      <span className={classes.record} data-spinning={spinning || undefined} aria-hidden="true">
        <span className={classes.labelDisc} />
      </span>
      <span className={classes.cover}>
        {artwork ? (
          <img src={artwork} alt={`${title} cover art`} className={classes.art} />
        ) : (
          <span className={classes.blank}>
            <span>{title}</span>
          </span>
        )}
      </span>
    </button>
  );
}
