import { ActionIcon, Anchor, Group, Text, Tooltip } from '@mantine/core';
import {
  IconBrandSoundcloud,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from '@tabler/icons-react';
import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { artwork } from '@/lib/soundcloud';
import { featuredAlbum, site } from '@/lib/site';
import classes from './TransportBar.module.css';

/** The DAW-style transport pinned to the top: it drives the SoundCloud player from anywhere on the page. */
export function TransportBar() {
  const { status, tracks, current, playing, progress, toggle, next, prev } = usePlayer();
  const { setPowered } = usePower();
  const track = tracks[current];
  const ready = status === 'ready' && tracks.length > 0;
  const art = track ? artwork(track) : null;

  const onPlay = () => {
    if (!playing) setPowered(true);
    toggle();
  };

  return (
    <header className={classes.bar}>
      <a href="#top" className={classes.wordmark} aria-label={`${site.name}, back to top`}>
        One <span>Small</span> Studio
      </a>

      <Group gap={4} wrap="nowrap" className={classes.controls}>
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

      <div className={classes.nowPlaying} aria-live="polite">
        {art && <img src={art} alt="" className={classes.art} />}
        <div className={classes.meta}>
          <span className="label">{playing ? 'Now playing' : ready ? 'Cued' : 'Transport'}</span>
          <Text size="sm" truncate="end" className={classes.title}>
            {track?.title ??
              (status === 'loading'
                ? 'Loading SoundCloud…'
                : status === 'error'
                  ? 'SoundCloud is not responding'
                  : featuredAlbum.title)}
          </Text>
        </div>
      </div>

      {site.soundcloud && (
        <Tooltip label="Open my SoundCloud">
          <Anchor href={site.soundcloud} target="_blank" rel="noreferrer" className={classes.sc}>
            <IconBrandSoundcloud size={26} aria-label="SoundCloud" />
          </Anchor>
        </Tooltip>
      )}

      <div className={classes.progress} style={{ transform: `scaleX(${progress})` }} />
    </header>
  );
}
