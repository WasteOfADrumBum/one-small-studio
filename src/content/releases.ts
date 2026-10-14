import { featuredAlbum } from '@/lib/site';

/**
 * The Catalog: one entry per release on the record ledge. Add releases here and the shelf, its
 * navigation and the liner notes grow with them; the admin will take this list over later.
 *
 * Releases are shown as record sleeves, but that's presentation only: `format` says what the
 * release really is, and the page says so next to it.
 */
export type Release = {
  id: string;
  title: string;
  artist: string;
  /** What Josh did on it, shown with the title. */
  credit: string;
  format: string;
  pageUrl: string;
  /** Cover art URL. Leave it out for the featured album: the player supplies its artwork. */
  artwork?: string;
  /** True for the album the site's player has loaded, which gets the tracklist and Play. */
  playable?: boolean;
};

export const releases: Release[] = [
  {
    id: 'user-agreement',
    title: featuredAlbum.title,
    artist: featuredAlbum.artist,
    credit: 'Artist',
    format: 'Digital album on SoundCloud',
    pageUrl: featuredAlbum.pageUrl,
    playable: true,
  },
];
