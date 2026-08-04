import { describe, expect, it } from "vitest";

import {
  emailSchema,
  loginSchema,
  otpSchema,
  passwordSchema,
  verifyOtpSchema,
} from "@/utils/validation";

describe("validators", () => {
  it("accepts valid emails", () => {
    expect(emailSchema.parse("pilot@eagerpilots.com")).toBe("pilot@eagerpilots.com");
  });

  it("rejects invalid emails", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
  });

  it("validates OTP shape", () => {
    expect(otpSchema.parse("123456")).toBe("123456");
    expect(() => otpSchema.parse("12ab56")).toThrow();
  });

  it("enforces password rules", () => {
    expect(passwordSchema.parse("Secret12")).toBe("Secret12");
    expect(() => passwordSchema.parse("short1")).toThrow();
    expect(() => passwordSchema.parse("nodigits")).toThrow();
  });

  it("parses login and verify schemas", () => {
    expect(loginSchema.parse({ email: "a@b.co" }).email).toBe("a@b.co");
    expect(
      verifyOtpSchema.parse({
        email: "a@b.co",
        token: "123456",
        purpose: "login",
      }).purpose,
    ).toBe("login");
  });
});
