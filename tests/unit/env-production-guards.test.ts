/**
 * Production env guards must not throw (throws 500 Server Components).
 */

import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("getServerEnv production guards", () => {
  it("forces demo OTP off instead of throwing in production", async () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    process.env.ENABLE_DEMO_OTP = "true";
    process.env.AUTH_SECRET = "strong-production-secret-value-32";
    process.env.DEMO_OTP_CODE = "123456";

    const { getServerEnv } = await import("@/config/env");
    const env = getServerEnv();
    expect(env.ENABLE_DEMO_OTP).toBe(false);
  });
});
