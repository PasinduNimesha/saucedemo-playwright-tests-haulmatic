import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for SauceDemo automation suite.
 * Covers Chromium, Firefox, WebKit (desktop + mobile viewports).
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is left in the source */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Limit parallelism on CI */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  /* Shared settings for all projects */
  use: {
    baseURL: 'https://www.saucedemo.com',

    /* Collect trace on first retry */
    trace: 'on-first-retry',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on first retry */
    video: 'on-first-retry',

    /* Increase default timeout for slower CI environments */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  /* Global timeout per test */
  timeout: 60_000,

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Browser projects */
  projects: [
    // ── Desktop browsers ──────────────────────────────────────────────────────
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

    // ── Mobile viewports (cross-browser spec only) ────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/cross-browser.spec.ts',
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: '**/cross-browser.spec.ts',
    },
  ],
});
