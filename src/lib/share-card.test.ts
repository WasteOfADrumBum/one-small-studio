import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');

function meta(attr: 'property' | 'name', key: string): string | undefined {
  const match = html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`));
  return match?.[1];
}

describe('share card', () => {
  it('points Open Graph and Twitter at the same absolute 1200x630 image', () => {
    const image = 'https://studio.onesmall.company/og-image.png';
    expect(meta('property', 'og:image')).toBe(image);
    expect(meta('name', 'twitter:image')).toBe(image);
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    expect(meta('property', 'og:image:width')).toBe('1200');
    expect(meta('property', 'og:image:height')).toBe('630');
  });

  it('ships a 1200x630 PNG in public/', () => {
    const png = readFileSync(new URL('public/og-image.png', root));
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    // IHDR width and height, big-endian, right after the 8-byte signature and chunk header.
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    // Link previews (WhatsApp, some Slack clients) skip images much over a few hundred KB.
    expect(png.length).toBeLessThan(600_000);
  });
});
