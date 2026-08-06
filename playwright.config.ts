import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT || 3000);
const BASE = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        // Bind explicitly so CI/local custom PLAYWRIGHT_PORT works with `next start`.
        command: process.env.CI ? `npx next start -p ${PORT}` : `npm run dev -- -p ${PORT}`,
        url: `${BASE}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          ...process.env,
          PORT: String(PORT),
          ENABLE_DEMO_OTP: process.env.ENABLE_DEMO_OTP ?? "true",
          FORCE_DEMO_OTP: process.env.FORCE_DEMO_OTP ?? "true",
          DEMO_OTP_CODE: process.env.DEMO_OTP_CODE ?? "123456",
          NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
        },
      },
});
