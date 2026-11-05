import { defineConfig, devices } from '@playwright/test';

/**
 * Browser half of the production smoke check (scripts/smoke). Read-only: it loads the live site,
 * never submits the talkback form, and never presses play. No retries, so a flaky production
 * page shows up as a failure. Run: `npm run smoke:browser` (SMOKE_URL overrides the address).
 */
export default defineConfig({
  testDir: 'scripts/smoke',
  testMatch: /\.spec\.ts$/,
  retries: 0,
  timeout: 60_000,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never', outputFolder: 'playwright-smoke-report' }]]
    : [['list']],
  use: {
    baseURL: process.env.SMOKE_URL || 'https://studio.onesmall.company',
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
