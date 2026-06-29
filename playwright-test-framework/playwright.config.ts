import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env (if present) so SAUCEDEMO_BASE_URL / DEMO_PORT can be overridden locally.
dotenv.config();

/** Port used by the local http-server that serves the self-contained demo app. */
const DEMO_PORT = Number(process.env.DEMO_PORT ?? 4173);

/**
 * Playwright configuration.
 *
 * - `baseURL` targets the local demo app (tests in tests/demo-local use relative paths).
 * - SauceDemo tests navigate to absolute URLs and therefore ignore `baseURL`.
 * - The `webServer` block boots an http-server for the demo app and tears it down afterwards.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${DEMO_PORT}`,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npx http-server ./demo-app -p ${DEMO_PORT} -c-1 --silent`,
    url: `http://localhost:${DEMO_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
