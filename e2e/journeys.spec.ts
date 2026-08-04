/**
 * E2E journeys — Chromium via Playwright.
 * Full role coverage is also exercised by `npm run uat` HTTP harness.
 */

import { expect, test } from "@playwright/test";

test.describe("public surfaces", () => {
  test("health endpoint is healthy", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status || json.ok || json.success !== false).toBeTruthy();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in", { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /continue with email/i })).toBeVisible();
  });

  test("certificate verify page loads", async ({ page }) => {
    await page.goto("/verify/certificate");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("student journey (OTP demo)", () => {
  test("student can request OTP and reach dashboard APIs", async ({ page, request }) => {
    await page.goto("/login");
    // Public API path for mobile readiness
    const otpReq = await request.post("/api/v1/auth/otp/request", {
      data: { email: "student.one@eagerpilots.com", purpose: "login" },
    });
    const otpJson = await otpReq.json();
    expect(otpJson.success).toBeTruthy();

    const verify = await request.post("/api/v1/auth/otp/verify", {
      data: {
        email: "student.one@eagerpilots.com",
        token: "123456",
        purpose: "login",
      },
    });
    const tokens = await verify.json();
    expect(tokens.success).toBeTruthy();
    expect(tokens.data.accessToken).toBeTruthy();

    const me = await request.get("/api/v1/me", {
      headers: { Authorization: `Bearer ${tokens.data.accessToken}` },
    });
    const meJson = await me.json();
    expect(meJson.success).toBeTruthy();
    expect(meJson.data.user.role).toBe("student");
  });
});

test.describe("admin / super-admin API gates", () => {
  test("unauthenticated platform monitoring is rejected", async ({ request }) => {
    const res = await request.get("/api/v1/platform/monitoring");
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });
});
