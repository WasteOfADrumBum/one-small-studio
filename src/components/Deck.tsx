import { ActionIcon, Anchor, Group, Skeleton, Text, UnstyledButton } from '@mantine/core';
import {
  IconBrandSoundcloud,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from '@tabler/icons-react';
import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { featuredAlbum } from '@/lib/site';
import { artwork, formatTime } from '@/lib/soundcloud';
import classes from './Deck.module.css';

/** The tape deck beside the console: the featured album's tracklist with its own transport. */
export function Deck() {
  const { status, tracks, current, playing, progress, play, toggle, next, prev } = usePlayer();
  const { setPowered } = usePower();
  const ready = status === 'ready' && tracks.length > 0;
  const cover = tracks[0] ? artwork(tracks[0]) : null;

  const onTrack = (index: number) => {
    setPowered(true);
    if (index === current && playing) toggle();
    else play(index);
  };
  const onPlay = () => {
    if (!playing) setPowered(true);
    toggle();
  };

  return (
    <aside className={classes.deck} aria-label={`${featuredAlbum.title} tracklist`}>
      <header className={classes.head}>
        {cover ? (
          <img src={cover} alt={`${featuredAlbum.title} cover`} className={classes.cover} />
        ) : (
          <span className={classes.cover} />
        )}
        <div className={classes.headText}>
          <span className="label">{playing ? 'Now playing' : 'Loaded'}</span>
          <span className={classes.album}>{featuredAlbum.title}</span>
          <Anchor
            href={featuredAlbum.pageUrl}
            target="_blank"
            rel="noreferrer"
            size="xs"
            c="dimmed"
            className={classes.scLink}
          >
            <IconBrandSoundcloud size={14} /> {featuredAlbum.artist} on SoundCloud
          </Anchor>
        </div>
      </header>

      <ol className={classes.list}>
        {status === 'loading' &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton height={18} my={9} />
            </li>
          ))}
        {ready &&
          tracks.map((track, i) => {
            const isCurrent = i === current;
            return (
              <li key={track.id}>
                <UnstyledButton
                  className={classes.track}
                  data-current={isCurrent || undefined}
                  data-playing={(isCurrent && playing) || undefined}
                  onClick={() => onTrack(i)}
                  aria-label={`${isCurrent && playing ? 'Pause' : 'Play'} ${track.title}`}
                >
                  <span className={classes.num}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={classes.trackTitle}>{track.title}</span>
                  <span className={classes.time}>{formatTime(track.duration)}</span>
                </UnstyledButton>
              </li>
            );
          })}
        {(status === 'error' || status === 'off') && (
          <li>
            <Text size="sm" c="dimmed" p="sm">
              SoundCloud is not answering right now.{' '}
              <Anchor href={featuredAlbum.pageUrl} target="_blank" rel="noreferrer">
                Listen there instead
              </Anchor>
              .
            </Text>
          </li>
        )}
      </ol>

      <footer className={classes.foot}>
        <div className={classes.progress}>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <Group gap={6} justify="center" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={prev}
            disabled={!ready}
            aria-label="Previous track"
          >
            <IconPlayerSkipBackFilled size={16} />
          </ActionIcon>
          <ActionIcon
            variant="filled"
            radius="xl"
            size="lg"
            onClick={onPlay}
            disabled={!ready}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />}
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={next}
            disabled={!ready}
            aria-label="Next track"
          >
            <IconPlayerSkipForwardFilled size={16} />
          </ActionIcon>
        </Group>
      </footer>
    </aside>
  );
}
