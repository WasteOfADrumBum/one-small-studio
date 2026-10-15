import { featuredAlbum } from '@/lib/site';

/**
 * The Catalog: one entry per release, each on its own shelf. Add releases here and the shelves and
 * liner notes grow with them, and the site's player can load any of them; the admin will take this
 * list over later. The first release is the one the player loads with the page.
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
   * What the SoundCloud player loads. For a private set, use the API URL with its secret token from
   * SoundCloud's embed code when you have it; the set's secret page link also works.
   */
  playerUrl: string;
  /**
   * Cover art URL. Optional: once the player has loaded a release it uses that art, and until then
   * the shelf asks SoundCloud for the cover and shows a plain sleeve while it waits.
   */
  artwork?: string;
  /** Track titles in order, shown in the liner notes until the player has loaded the release. */
  tracks?: string[];
  /** Running time as SoundCloud shows it, for the same. */
  runtime?: string;
};

export const releases: Release[] = [
  {
    id: 'user-agreement',
    title: featuredAlbum.title,
    artist: featuredAlbum.artist,
    credit: 'Artist',
    format: 'Digital album on SoundCloud',
    pageUrl: featuredAlbum.pageUrl,
    playerUrl: featuredAlbum.playerUrl,
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
    playerUrl:
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
  {
    id: 'untranslated',
    title: 'untranslated',
    artist: 'Joshua Small',
    credit: 'Artist',
    format: 'Digital album on SoundCloud',
    pageUrl: 'https://soundcloud.com/joshua-small-325495450/sets/untranslated/s-1x98w0lZejR',
    playerUrl: 'https://soundcloud.com/joshua-small-325495450/sets/untranslated/s-1x98w0lZejR',
    runtime: '30:59',
    tracks: [
      'Wired Different',
      "The World's Too Loud",
      'Under My Skin',
      'Losing the Thread',
      'Three Small Worlds',
      'Same Language, Different Dialect',
      'After the Mask',
      'Find Your Tribe',
    ],
  },
];
