import { describe, expect, it } from "vitest";

import {
  buildRegistrationPhone,
  dialCountryFromRegistrationCountry,
  formatLocalPhoneDisplay,
  parseLocalDigitsFromInput,
  validateLocalMobile,
  validateRegistrationPhoneE164,
} from "@/utils/registration-phone";
import { registerSchema } from "@/utils/validation";

describe("registration phone utilities", () => {
  it("maps registration country codes to dial countries", () => {
    expect(dialCountryFromRegistrationCountry("KW")).toBe("KW");
    expect(dialCountryFromRegistrationCountry("AE")).toBe("AE");
    expect(dialCountryFromRegistrationCountry("US")).toBeNull();
  });

  it("parses pasted international numbers into local digits", () => {
    expect(parseLocalDigitsFromInput("KW", "+965 5012 3456")).toBe("50123456");
    expect(parseLocalDigitsFromInput("AE", "+971501234567")).toBe("501234567");
  });

  it("builds E.164 numbers from dial country and local digits", () => {
    expect(buildRegistrationPhone("KW", "50123456")).toBe("+96550123456");
    expect(buildRegistrationPhone("AE", "501234567")).toBe("+971501234567");
  });

  it("formats local display with spacing", () => {
    expect(formatLocalPhoneDisplay("KW", "50123456")).toBe("5012 3456");
    expect(formatLocalPhoneDisplay("AE", "501234567")).toBe("50 123 4567");
  });

  it("validates Kuwait mobile numbers", () => {
    expect(validateLocalMobile("KW", "50123456")).toBeNull();
    expect(validateLocalMobile("KW", "60123456")).toBeNull();
    expect(validateLocalMobile("KW", "90123456")).toBeNull();
    expect(validateLocalMobile("KW", "40123456")).toMatch(/valid Kuwait/i);
    expect(validateLocalMobile("KW", "501234")).toMatch(/8 digits/i);
  });

  it("validates UAE mobile numbers", () => {
    expect(validateLocalMobile("AE", "501234567")).toBeNull();
    expect(validateLocalMobile("AE", "401234567")).toMatch(/valid UAE/i);
    expect(validateLocalMobile("AE", "50123456")).toMatch(/9 digits/i);
  });

  it("validates E.164 registration phones", () => {
    expect(validateRegistrationPhoneE164("+96550123456")).toBeNull();
    expect(validateRegistrationPhoneE164("+971501234567")).toBeNull();
    expect(validateRegistrationPhoneE164("+441234567890")).toMatch(/Kuwait|UAE/i);
  });
});

describe("registerSchema phone validation", () => {
  const base = {
    firstName: "Amira",
    lastName: "Hassan",
    email: "amira@eagerpilots.com",
    nationality: "Kuwaiti",
    password: "Secret12!",
    confirmPassword: "Secret12!",
    acceptTerms: true,
    acceptPrivacy: true,
    role: "student" as const,
  };

  it("accepts valid Kuwait and UAE numbers", () => {
    expect(registerSchema.parse({ ...base, phone: "+96550123456", countryCode: "KW" }).phone).toBe(
      "+96550123456",
    );
    expect(
      registerSchema.parse({
        ...base,
        phone: "+971501234567",
        countryCode: "AE",
        nationality: "Emirati",
      }).phone,
    ).toBe("+971501234567");
  });

  it("rejects invalid mobile numbers", () => {
    expect(() =>
      registerSchema.parse({ ...base, phone: "+96540123456", countryCode: "KW" }),
    ).toThrow(/Kuwait/i);
    expect(() =>
      registerSchema.parse({
        ...base,
        phone: "+971401234567",
        countryCode: "AE",
        nationality: "Emirati",
      }),
    ).toThrow(/UAE/i);
  });
});
