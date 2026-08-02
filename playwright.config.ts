import { defineConfig, devices } from '@playwright/test';

const desktopSmokeTests = /(?:admin-login|navigation|rbac|api-smoke|performance|console-network)\.spec\.ts/;
const crossDeviceTests = /(?:responsive|visual-regression|accessibility)\.spec\.ts/;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://sooqna.site',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    ignoreHTTPSErrors: false,
  },
  projects: [
    {
      name: 'desktop-chromium',
      testMatch: desktopSmokeTests,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-visual',
      testMatch: crossDeviceTests,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-iphone',
      testMatch: crossDeviceTests,
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-android',
      testMatch: crossDeviceTests,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'tablet',
      testMatch: crossDeviceTests,
      use: { ...devices['iPad Pro 11'] },
    },
  ],
  outputDir: 'test-results/artifacts',
});
