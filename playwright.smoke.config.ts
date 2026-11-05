import { defineConfig, devices } from '@playwright/test';

/**
 * Browser half of the production smoke check (scripts/smoke). Read-only: it loads the live site,
 * never submits the talkback form, and never presses play. No retries, so a flaky production
 * page shows up as a failure. Run: `npm run smoke:browser` (SMOKE_URL overrides the address).
 */
// The same allowlist as scripts/smoke/smoke.mjs: production, or a local preview with SMOKE_LOCAL=1.
const target = new URL(process.env.SMOKE_URL || 'https://studio.onesmall.company');
const local =
  process.env.SMOKE_LOCAL === '1' && ['localhost', '127.0.0.1'].includes(target.hostname);
if (!local && (target.protocol !== 'https:' || target.host !== 'studio.onesmall.company')) {
  throw new Error(`Refusing to smoke-test ${target.origin}: not a trusted production address.`);
}

export default defineConfig({
  testDir: 'scripts/smoke',
  testMatch: /\.spec\.ts$/,
  retries: 0,
  timeout: 60_000,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never', outputFolder: 'playwright-smoke-report' }]]
    : [['list']],
  use: {
    baseURL: target.origin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
