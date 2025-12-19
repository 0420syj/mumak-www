import { defineConfig, devices } from '@playwright/test';

const PORT = 3002;
const isCI = !!process.env.CI;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Use more workers in CI for parallel execution within each browser */
  workers: isCI ? 2 : '50%',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI ? [['html'], ['github']] : 'list',
  /* Global timeout - reduce for faster feedback */
  timeout: 30_000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Speed up tests by not waiting for animations */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  /* Configure projects for major browsers */
  projects: isCI
    ? [
        // CI: Test all browsers for cross-browser compatibility
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ]
    : [
        // Local: Only chromium for fast feedback (use --project=all for full test)
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // CI uses pre-built output (next start), local uses dev server
    command: isCI ? 'pnpm start:e2e' : 'pnpm dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
