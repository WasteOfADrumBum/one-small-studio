import {
  Anchor,
  Button,
  Container,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBrandSoundcloud,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { artwork, formatTime } from '@/lib/soundcloud';
import { site } from '@/lib/site';
import { LedMeter } from './LedMeter';
import classes from './Catalog.module.css';

/** Section 5, "The Catalog": every public track on the SoundCloud profile, playable in place. */
export function Catalog() {
  const { status, tracks, current, playing, play, toggle } = usePlayer();
  const { setPowered } = usePower();

  const onTrack = (index: number) => {
    setPowered(true);
    if (index === current && status === 'ready') toggle();
    else play(index);
  };

  return (
    <section id="catalog" className={classes.catalog} aria-labelledby="catalog-title">
      <Container size="lg">
        <Stack gap={4} mb="xl">
          <span className="label">Track 04 · The catalog</span>
          <Title id="catalog-title" order={2} className={classes.heading}>
            The catalog
          </Title>
          <Text c="dimmed" maw={620}>
            Records I played on, tracked, mixed and produced. Hit any cover and the transport up top
            takes over.
          </Text>
        </Stack>

        {status === 'loading' && (
          <div className={classes.grid}>
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className={classes.skeleton} />
            ))}
          </div>
        )}

        {status === 'ready' && (
          <ol className={classes.grid}>
            {tracks.map((track, i) => {
              const art = artwork(track);
              const isCurrent = i === current && playing;
              return (
                <li key={track.id}>
                  <UnstyledButton
                    className={classes.card}
                    data-current={isCurrent || undefined}
                    onClick={() => onTrack(i)}
                    aria-label={`${isCurrent ? 'Pause' : 'Play'} ${track.title}`}
                  >
                    <div className={classes.cover}>
                      {art ? (
                        <img src={art} alt="" loading="lazy" />
                      ) : (
                        <span className={classes.noArt} />
                      )}
                      <span className={classes.playIcon}>
                        {isCurrent ? (
                          <IconPlayerPauseFilled size={28} />
                        ) : (
                          <IconPlayerPlayFilled size={28} />
                        )}
                      </span>
                      {isCurrent && (
                        <span className={classes.meters}>
                          <LedMeter active speed={0.8} />
                          <LedMeter active speed={1.1} />
                        </span>
                      )}
                    </div>
                    <span className={classes.trackTitle}>{track.title}</span>
                    <span className="label">
                      {formatTime(track.duration)}
                      {track.genre ? ` · ${track.genre}` : ''}
                    </span>
                  </UnstyledButton>
                </li>
              );
            })}
          </ol>
        )}

        {(status === 'off' || status === 'error') && (
          <div className={classes.empty}>
            <Text c="dimmed">
              {status === 'off'
                ? 'The tapes are still being pulled from the shelf. Tracks land here as soon as my SoundCloud is hooked up.'
                : 'SoundCloud is not answering right now.'}
            </Text>
            {site.soundcloud && (
              <Button
                component="a"
                href={site.soundcloud}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                leftSection={<IconBrandSoundcloud size={18} />}
              >
                Listen on SoundCloud
              </Button>
            )}
          </div>
        )}

        {status === 'ready' && site.soundcloud && (
          <Anchor href={site.soundcloud} target="_blank" rel="noreferrer" className={classes.more}>
            <IconBrandSoundcloud size={18} /> More on SoundCloud
          </Anchor>
        )}
      </Container>
    </section>
  );
}
