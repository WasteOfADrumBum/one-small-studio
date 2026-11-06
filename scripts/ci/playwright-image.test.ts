import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The browser jobs run inside Playwright's image instead of downloading browsers. Its browsers
// only work with the matching @playwright/test, so a version bump must move every image with it.
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  devDependencies: Record<string, string>;
};
const version = pkg.devDependencies['@playwright/test'];
const workflows = ['.github/workflows/ci.yml', '.github/workflows/smoke.yml'];
const images = workflows.flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/^\s+image:\s*(\S+)\s*$/gm)].map((m) => ({
    file,
    image: m[1],
  })),
);

describe('Playwright container images', () => {
  it('are used by every browser job', () => {
    // browser and cross-browser in CI, the smoke job in smoke.yml.
    expect(images.filter((i) => i.file.endsWith('ci.yml'))).toHaveLength(2);
    expect(images.filter((i) => i.file.endsWith('smoke.yml'))).toHaveLength(1);
  });

  it('match the pinned @playwright/test version exactly', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    for (const { image } of images) {
      expect(image).toMatch(
        new RegExp(`^mcr\\.microsoft\\.com/playwright:v${version.replaceAll('.', '\\.')}-`),
      );
    }
  });

  it('are pinned by digest', () => {
    for (const { image } of images) expect(image).toMatch(/@sha256:[0-9a-f]{64}$/);
  });

  it('leave no job downloading browsers', () => {
    for (const file of workflows)
      expect(readFileSync(file, 'utf8')).not.toMatch(/playwright install/);
  });
});
