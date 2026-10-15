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
  /**
   * Cover art URL. Leave it out for the featured album, whose artwork comes from the player; for
   * other releases the shelf asks SoundCloud for the cover and shows a plain sleeve until then.
   */
  artwork?: string;
  /** Track titles in order, for releases the player doesn't load. */
  tracks?: string[];
  /** Running time as SoundCloud shows it, for releases the player doesn't load. */
  runtime?: string;
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
  {
    id: 'when-the-stones-weep',
    title: 'When the Stones Weep',
    artist: 'Joshua Small',
    credit: 'Artist',
    format: 'Digital album on SoundCloud',
    // A private set: the secret token at the end of the link is what lets visitors open it.
    pageUrl:
      'https://soundcloud.com/joshua-small-325495450/sets/when-the-stones-weep/s-WOZW3XGpQ9J',
    runtime: '38:39',
    tracks: [
      'Erosion of Memory',
      'As Shadows Breathe',
      'The Hanged God Dreams',
      'Scars that Sing',
      'Banners in the Fog',
      'Iron in the Blood',
      'Cairns for the Forgotten',
      'Twilight Wounds',
      'Dirge for a Broken Blade',
      'Grief Upon the Wind',
      'Where the Stone Remembers',
    ],
  },
];
