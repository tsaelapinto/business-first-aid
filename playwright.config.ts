import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  retries: 2,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://businessaid.tsaela.com',
    headless: true,
    ...devices['Desktop Chrome'],
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
  },
});
