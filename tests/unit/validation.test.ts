import { describe, expect, it } from "vitest";

import {
  emailSchema,
  loginSchema,
  otpSchema,
  passwordSchema,
  registerSchema,
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
    expect(passwordSchema.parse("Secret12!")).toBe("Secret12!");
    expect(() => passwordSchema.parse("Secret12")).toThrow();
    expect(() => passwordSchema.parse("short1")).toThrow();
    expect(() => passwordSchema.parse("nodigits")).toThrow();
  });

  it("parses enterprise registration payload", () => {
    const parsed = registerSchema.parse({
      firstName: "Amira",
      lastName: "Hassan",
      email: "amira@eagerpilots.com",
      phone: "+971501234567",
      countryCode: "AE",
      nationality: "Emirati",
      password: "Secret12!",
      confirmPassword: "Secret12!",
      acceptTerms: true,
      acceptPrivacy: true,
      marketingConsent: false,
      role: "student",
    });
    expect(parsed.email).toBe("amira@eagerpilots.com");
    expect(parsed.phone).toBe("+971501234567");
  });

  it("rejects disposable email domains for registration", () => {
    expect(() =>
      registerSchema.parse({
        firstName: "Amira",
        lastName: "Hassan",
        email: "temp@mailinator.com",
        phone: "+971501234567",
        countryCode: "AE",
        nationality: "Emirati",
        password: "Secret12!",
        confirmPassword: "Secret12!",
        acceptTerms: true,
        acceptPrivacy: true,
        role: "student",
      }),
    ).toThrow();
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
