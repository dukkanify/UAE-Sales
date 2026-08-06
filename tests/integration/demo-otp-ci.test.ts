/**
 * CI e2e runs `next start` (NODE_ENV=production). Demo OTP must still work when
 * ENABLE_DEMO_OTP is on and the app env is not production / FORCE_DEMO_OTP is set.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { requestOtp } from "@/services/auth/auth-service";
import { readAuthDb } from "@/services/auth/store";
import { hashValue } from "@/lib/security/crypto";

describe("demo OTP under production NODE_ENV (CI e2e)", () => {
  beforeAll(() => {
    process.env.ENABLE_DEMO_OTP = "true";
    process.env.FORCE_DEMO_OTP = "true";
    process.env.DEMO_OTP_CODE = "123456";
    process.env.NEXT_PUBLIC_APP_ENV = "development";
    ensureDemoUsersSeeded();
  });

  it("issues the fixed demo OTP code for student.one", async () => {
    const email = "student.one@eagerpilots.com";
    const req = await requestOtp({ email, purpose: "login", rememberMe: true });
    expect(req.success).toBe(true);
    expect(req.data?.demoOtp).toBe("123456");

    const challenge = readAuthDb().otps.find((o) => o.email === email && o.purpose === "login");
    expect(challenge).toBeTruthy();
    expect(challenge!.codeHash).toBe(hashValue("123456"));
  });
});
