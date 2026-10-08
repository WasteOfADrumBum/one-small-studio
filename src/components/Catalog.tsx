import { Anchor, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import {
  IconBrandSoundcloud,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { artwork, formatTime } from '@/lib/soundcloud';
import { featuredAlbum, site } from '@/lib/site';
import classes from './Catalog.module.css';

/** Section 4, "The Catalog": releases, starting with the featured album. The admin adds more later. */
export function Catalog() {
  const { status, tracks, playing, play, toggle } = usePlayer();
  const { setPowered } = usePower();
  const ready = status === 'ready' && tracks.length > 0;
  const cover = tracks[0] ? artwork(tracks[0]) : null;
  const runtime = tracks.reduce((sum, t) => sum + t.duration, 0);

  const onPlay = () => {
    setPowered(true);
    if (playing) toggle();
    else play();
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
            Records I played on, tracked, mixed and produced.
          </Text>
        </Stack>

        <article className={classes.release}>
          <div className={classes.sleeve} data-playing={playing || undefined}>
            <span className={classes.vinyl} aria-hidden="true" />
            {cover ? (
              <img src={cover} alt={`${featuredAlbum.title} cover`} className={classes.cover} />
            ) : (
              <span className={classes.cover} />
            )}
          </div>
          <Stack gap="sm" className={classes.info}>
            <span className="label">Featured album</span>
            <Title order={3} className={classes.album}>
              {featuredAlbum.title}
            </Title>
            <Text c="dimmed">
              {featuredAlbum.artist}
              {ready && ` · ${tracks.length} tracks · ${formatTime(runtime)}`}
            </Text>
            <Group gap="sm" mt="sm">
              <Button
                onClick={onPlay}
                disabled={!ready}
                leftSection={
                  playing ? <IconPlayerPauseFilled size={16} /> : <IconPlayerPlayFilled size={16} />
                }
              >
                {playing ? 'Pause' : 'Play the album'}
              </Button>
              <Button
                component="a"
                href={featuredAlbum.pageUrl}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                leftSection={<IconBrandSoundcloud size={18} />}
              >
                Open on SoundCloud
              </Button>
            </Group>
          </Stack>
        </article>

        <Anchor href={site.soundcloud} target="_blank" rel="noreferrer" className={classes.more}>
          <IconBrandSoundcloud size={18} /> Everything else is on my SoundCloud
        </Anchor>
      </Container>
    </section>
  );
}
