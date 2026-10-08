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
} as const;

/** Sister sites and profiles. Leave a URL empty to hide its link. */
export const links = [
  { label: 'SoundCloud', href: '' },
  { label: 'One Small Photo', href: '' },
  { label: 'Web dev portfolio', href: '' },
] as const;
