import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Button } from '@mantine/core';
import {
  IconBrandSoundcloud,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { releases } from '@/content/releases';
import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { artwork, formatTime } from '@/lib/soundcloud';
import { site } from '@/lib/site';
import { RecordSleeve } from './RecordSleeve';
import { SectionHeader } from './SectionHeader';
import { StaticTrackList, TrackList } from './TrackList';
import classes from './Catalog.module.css';

// Hand-placed, not random: small turns that repeat in a pattern.
const TILTS = [-1.2, 0.8, -0.4, 1.1, -0.9];

/**
 * Cover art for releases the player doesn't load, asked of SoundCloud's oEmbed endpoint by page
 * URL. Anything that fails leaves that release on its plain sleeve.
 */
function useShelfArt() {
  const [art, setArt] = useState<Record<string, string>>({});
  useEffect(() => {
    const controller = new AbortController();
    for (const r of releases) {
      if (r.playable || r.artwork) continue;
      const url = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(r.pageUrl)}`;
      fetch(url, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { thumbnail_url?: string } | null) => {
          const thumb = data?.thumbnail_url;
          if (thumb) setArt((a) => ({ ...a, [r.id]: thumb }));
        })
        .catch(() => {});
    }
    return () => controller.abort();
  }, []);
  return art;
}

/** Section 4, "The Catalog": releases as sleeves on a record shelf, with liner notes for the pick. */
export function Catalog() {
  const { status, tracks, playing, play, toggle } = usePlayer();
  const { setPowered } = usePower();
  const [selectedId, setSelectedId] = useState(releases[0]?.id);
  const shelfArt = useShelfArt();
  const ledge = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();
  const index = Math.max(
    0,
    releases.findIndex((r) => r.id === selectedId),
  );
  const release = releases[index];
  const ready = status === 'ready' && tracks.length > 0;
  const playerArt = tracks[0] ? artwork(tracks[0]) : null;
  const runtime = tracks.reduce((sum, t) => sum + t.duration, 0);

  if (!release) return null;
  const isPlayable = !!release.playable;

  const onPlay = () => {
    setPowered(true);
    if (playing) toggle();
    else play();
  };
  // Stepping also slides the shelf so the picked sleeve is in view; nothing else moves the page.
  const step = (by: number) => {
    const next = (index + by + releases.length) % releases.length;
    setSelectedId(releases[next].id);
    const shelf = ledge.current;
    const item = shelf?.children[next] as HTMLElement | undefined;
    if (shelf && item) {
      shelf.scrollTo({
        left:
          shelf.scrollLeft +
          item.getBoundingClientRect().left -
          shelf.getBoundingClientRect().left -
          18,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <section id="catalog" className={classes.catalog} aria-labelledby="catalog-title">
      <div className="oss-container">
        <SectionHeader label="Track 04 · The catalog" id="catalog-title" title="The catalog">
          Records I played on, tracked, mixed and produced.
        </SectionHeader>

        <div className={classes.display}>
          <div className={classes.wall}>
            <ul ref={ledge} className={classes.ledge} aria-label="Releases">
              {releases.map((r, i) => (
                <li key={r.id} className={classes.item}>
                  <RecordSleeve
                    title={r.title}
                    artwork={r.artwork ?? (r.playable ? playerArt : (shelfArt[r.id] ?? null))}
                    selected={r.id === release.id}
                    spinning={!!r.playable && playing}
                    tilt={TILTS[i % TILTS.length]}
                    onSelect={() => setSelectedId(r.id)}
                    describedBy={`release-${r.id}`}
                  />
                  <span className={classes.shelf} aria-hidden="true">
                    <span className={classes.lip} />
                    <span className={classes.shelfTop} />
                    <span className={classes.shelfFront} />
                  </span>
                  <p id={`release-${r.id}`} className={classes.caption}>
                    <span className={classes.captionTitle}>{r.title}</span>
                    <span>
                      {r.artist} · {r.credit}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
            {releases.length > 1 && (
              <div className={classes.shelfNav}>
                <button type="button" onClick={() => step(-1)} aria-label="Previous release">
                  <IconChevronLeft size={18} aria-hidden="true" />
                </button>
                <span className="label">
                  {index + 1} / {releases.length}
                </span>
                <button type="button" onClick={() => step(1)} aria-label="Next release">
                  <IconChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            )}
            <a href={site.soundcloud} target="_blank" rel="noreferrer" className={classes.more}>
              <IconBrandSoundcloud size={18} aria-hidden="true" /> Everything else is on my
              SoundCloud
            </a>
          </div>

          <article className={classes.notes} aria-labelledby="release-title">
            <span className={classes.notesKicker}>Liner notes</span>
            <h3 id="release-title" className={classes.album}>
              {release.title}
            </h3>
            <dl className={classes.facts}>
              <div>
                <dt>Artist</dt>
                <dd>{release.artist}</dd>
              </div>
              <div>
                <dt>My part</dt>
                <dd>{release.credit}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{release.format}</dd>
              </div>
              {isPlayable && ready && (
                <div>
                  <dt>Length</dt>
                  <dd>
                    {tracks.length} tracks · {formatTime(runtime)}
                  </dd>
                </div>
              )}
              {!isPlayable && release.tracks && (
                <div>
                  <dt>Length</dt>
                  <dd>
                    {release.tracks.length} tracks
                    {release.runtime && ` · ${release.runtime}`}
                  </dd>
                </div>
              )}
            </dl>
            <div className={classes.actions}>
              {isPlayable && (
                <Button
                  onClick={onPlay}
                  disabled={!ready}
                  leftSection={
                    playing ? (
                      <IconPlayerPauseFilled size={16} />
                    ) : (
                      <IconPlayerPlayFilled size={16} />
                    )
                  }
                >
                  {playing ? 'Pause' : 'Play the album'}
                </Button>
              )}
              <Button
                component="a"
                href={release.pageUrl}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                color="dark"
                className={classes.scButton}
                leftSection={<IconBrandSoundcloud size={18} />}
              >
                Open on SoundCloud
              </Button>
            </div>
            {isPlayable && (
              <div className={classes.tracklist}>
                <TrackList variant="notes" label={`${release.title} tracklist`} />
              </div>
            )}
            {!isPlayable && release.tracks && (
              <div className={classes.tracklist}>
                <StaticTrackList titles={release.tracks} label={`${release.title} tracklist`} />
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
