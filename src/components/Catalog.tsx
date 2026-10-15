import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from '@mantine/core';
import {
  IconBrandSoundcloud,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { releases } from '@/content/releases';
import { usePlayer } from '@/lib/player';
import { usePower } from '@/lib/power';
import { formatTime } from '@/lib/soundcloud';
import { site } from '@/lib/site';
import { RecordSleeve } from './RecordSleeve';
import { SectionHeader } from './SectionHeader';
import { StaticTrackList, TrackList } from './TrackList';
import classes from './Catalog.module.css';

// Hand-placed, not random: small turns that repeat in a pattern.
const TILTS = [-1.2, 0.8, -0.4, 1.1, -0.9];

/**
 * Cover art for releases the player hasn't loaded yet, asked of SoundCloud's oEmbed endpoint by
 * page URL. Anything that fails leaves that release on its plain sleeve until it is played.
 */
function useShelfArt() {
  const [art, setArt] = useState<Record<string, string>>({});
  useEffect(() => {
    const controller = new AbortController();
    for (const r of releases) {
      if (r.artwork) continue;
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

/**
 * The height of the first two rows of shelves, so the liner notes beside them hold one fixed size
 * whichever album is open and however many rows the catalog grows to.
 */
function useTwoRowHeight() {
  const ref = useRef<HTMLUListElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const top = list.getBoundingClientRect().top;
      const rows = [...list.children].map((li) => li.getBoundingClientRect());
      const tops = [...new Set(rows.map((r) => Math.round(r.top)))].sort((a, b) => a - b);
      const cutoff = tops[1] ?? tops[0];
      const bottom = Math.max(
        ...rows.filter((r) => Math.round(r.top) <= cutoff).map((r) => r.bottom),
      );
      setHeight(rows.length ? Math.round(bottom - top) : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  return [ref, height] as const;
}

/**
 * Section 4, "The Catalog": one shelf per release, each with its plaque, and liner notes for the
 * one in the player. Picking a record pulls it from its sleeve and loads that album into the
 * console and the transport bar, playing it; the liner notes follow.
 */
export function Catalog() {
  const { album, albumArt, loadAlbum, status, tracks, playing, toggle } = usePlayer();
  const { setPowered } = usePower();
  const shelfArt = useShelfArt();
  const [shelvesRef, twoRows] = useTwoRowHeight();
  const release = album;
  const ready = status === 'ready' && tracks.length > 0;
  const runtime = tracks.reduce((sum, t) => sum + t.duration, 0);

  if (!release) return null;

  const pick = (id: string) => {
    setPowered(true);
    loadAlbum(id, true);
  };
  const onPlay = () => {
    setPowered(true);
    toggle();
  };

  return (
    <section id="catalog" className={classes.catalog} aria-labelledby="catalog-title">
      <div className="oss-container">
        <SectionHeader label="Track 04 · The catalog" id="catalog-title" title="The catalog">
          Records I played on, tracked, mixed and produced.
        </SectionHeader>

        <div className={classes.display}>
          <div className={classes.wall}>
            <p id="shelf-hint" className="visually-hidden">
              Plays the album on the console.
            </p>
            <ul ref={shelvesRef} className={classes.shelves} aria-label="Releases">
              {releases.map((r, i) => (
                <li key={r.id} className={classes.row}>
                  <RecordSleeve
                    title={r.title}
                    artwork={r.artwork ?? albumArt[r.id] ?? shelfArt[r.id] ?? null}
                    selected={r.id === release.id}
                    spinning={r.id === release.id && playing}
                    tilt={TILTS[i % TILTS.length]}
                    onSelect={() => pick(r.id)}
                    describedBy={`plaque-${r.id} shelf-hint`}
                  />
                  <span className={classes.shelf} aria-hidden="true">
                    <span className={classes.lip} />
                    <span className={classes.shelfTop} />
                    <span className={classes.shelfFront} />
                  </span>
                  {/* The brass plate on the shelf's front edge. */}
                  <p id={`plaque-${r.id}`} className={classes.plaque}>
                    <span className={classes.plaqueTitle}>{r.title}</span>
                    <span className={classes.plaqueArtist}>{r.artist}</span>
                  </p>
                </li>
              ))}
            </ul>
            <a href={site.soundcloud} target="_blank" rel="noreferrer" className={classes.more}>
              <IconBrandSoundcloud size={18} aria-hidden="true" /> Everything else is on my
              SoundCloud
            </a>
          </div>

          <article
            className={classes.notes}
            aria-labelledby="release-title"
            style={twoRows ? ({ '--two-rows': `${twoRows}px` } as CSSProperties) : undefined}
          >
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
              {(ready || release.tracks) && (
                <div>
                  <dt>Length</dt>
                  <dd>
                    {ready
                      ? `${tracks.length} tracks · ${formatTime(runtime)}`
                      : `${release.tracks?.length} tracks${release.runtime ? ` · ${release.runtime}` : ''}`}
                  </dd>
                </div>
              )}
            </dl>
            <div className={classes.actions}>
              <Button
                size="sm"
                onClick={onPlay}
                disabled={!ready}
                leftSection={
                  playing ? <IconPlayerPauseFilled size={16} /> : <IconPlayerPlayFilled size={16} />
                }
              >
                {playing ? 'Pause' : 'Play the album'}
              </Button>
              <Button
                size="sm"
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
            <div className={classes.tracklist}>
              {/* The printed titles stand in while the player fetches the album. */}
              {status === 'loading' && release.tracks ? (
                <StaticTrackList titles={release.tracks} label={`${release.title} tracklist`} />
              ) : (
                <TrackList variant="notes" label={`${release.title} tracklist`} />
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
