/**
 * Site facts shared across sections. Change them here, not in component copy.
 *
 * This is a personal, non-commercial showcase: no rates, booking or sales anywhere on the site.
 */
export const site = {
  name: 'One Small Studio',
  owner: 'Joshua Small',
  tagline: 'Thirty years behind the kit and the console.',
  roles: ['Drums', 'Audio engineering', 'Live sound', 'Production'],
  genres: ['Rock', 'Punk', 'Metal', 'Ska'],
  playingLiveSince: 2004,
  recordingWorkshopGrad: 2011,
  soundcloud: 'https://soundcloud.com/joshua-small-325495450',
} as const;

/**
 * The album the console plays when it powers on. It is a private SoundCloud set, so the player
 * needs the API URL with its secret token (from SoundCloud's embed code), not the page URL.
 */
export const featuredAlbum = {
  title: 'User Agreement',
  artist: 'Joshua Small',
  pageUrl: 'https://soundcloud.com/joshua-small-325495450/sets/user-agreement/s-qRVRJX4AsJg',
  playerUrl:
    'https://api.soundcloud.com/playlists/soundcloud:playlists:2283071274?secret_token=s-qRVRJX4AsJg',
} as const;

/** Sister sites and profiles. Leave a URL empty to hide its link. */
export const links = [
  { label: 'SoundCloud', href: site.soundcloud },
  { label: 'One Small Photo', href: '' },
  { label: 'Web dev portfolio', href: '' },
] as const;
