import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { formatTime } from '@/lib/soundcloud';
import classes from './TrackList.module.css';

type TrackListProps = {
  /** `screen` is lit text on the console display; `notes` is ink on the catalog's liner notes. */
  variant: 'screen' | 'notes';
  label: string;
};

/** A release's tracks as printed liner notes: titles only, nothing to press. */
export function StaticTrackList({ titles, label }: { titles: string[]; label: string }) {
  return (
    <ol className={classes.list} data-variant="notes" aria-label={label}>
      {titles.map((title, i) => (
        <li key={title}>
          <span className={classes.track} data-static>
            <span className={classes.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={classes.title}>{title}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The featured album's tracks. Picking one starts it; picking the playing one pauses it. */
export function TrackList({ variant, label }: TrackListProps) {
  const { album, status, tracks, current, playing, play, toggle } = usePlayer();
  const { setPowered } = usePower();
  const ready = status === 'ready' && tracks.length > 0;

  const onTrack = (index: number) => {
    setPowered(true);
    if (index === current && playing) toggle();
    else play(index);
  };

  if (status === 'error' || status === 'off') {
    return (
      <p className={classes.message} data-variant={variant}>
        SoundCloud is not answering right now.{' '}
        <a href={album.pageUrl} target="_blank" rel="noreferrer">
          Listen there instead
        </a>
        .
      </p>
    );
  }

  return (
    <ol className={classes.list} data-variant={variant} aria-label={label} aria-busy={!ready}>
      {!ready &&
        Array.from({ length: 5 }, (_, i) => (
          <li key={i} className={classes.placeholder} aria-hidden="true" />
        ))}
      {ready &&
        tracks.map((track, i) => {
          const isCurrent = i === current;
          const isPlaying = isCurrent && playing;
          return (
            <li key={track.id}>
              <button
                type="button"
                className={classes.track}
                data-current={isCurrent || undefined}
                data-playing={isPlaying || undefined}
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => onTrack(i)}
                aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.title}, ${formatTime(track.duration)}`}
              >
                <span className={classes.num} aria-hidden="true">
                  {isPlaying ? '▶' : String(i + 1).padStart(2, '0')}
                </span>
                <span className={classes.title}>{track.title}</span>
                <span className={classes.time}>{formatTime(track.duration)}</span>
              </button>
            </li>
          );
        })}
    </ol>
  );
}
