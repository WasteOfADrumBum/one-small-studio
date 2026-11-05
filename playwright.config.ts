import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

/**
 * Browser tests run against the production build (dist/) served by server/preview.ts, which applies
 * vercel.json's rewrites and headers and runs the real Express API with a mail sink. Build first:
 * `npm run test:e2e` does both; CI builds once and runs `npm run e2e`.
 *
 * Chromium runs every test on desktop and on a Pixel 7. Firefox (desktop) and WebKit (iPhone 13)
 * run the tests tagged @critical: the journeys that must work in every engine we support.
 * Device emulation sets viewport, touch and user agent; it is not a real phone.
 */
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: CI,
  // One retry in CI shows whether a failure is a flake, and failOnFlakyTests still fails the run,
  // so a flaky test is reported instead of passing quietly.
  retries: CI ? 1 : 0,
  failOnFlakyTests: CI,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: CI
    ? [['github'], ['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    {
      name: 'firefox',
      grep: /@critical/,
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'webkit-phone', grep: /@critical/, use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npx tsx server/preview.ts',
    url: 'http://localhost:4173/api/health',
    // Never reuse a server already on the port: it could be `vite preview` proxying /api to a dev
    // API with real Resend keys, and the talkback tests would then send real email. Only this
    // command's server swaps the provider for the in-process sink.
    reuseExistingServer: false,
    stdout: 'pipe',
    timeout: 30_000,
  },
});
