import { describe, expect, it } from "vitest";

import {
  constantTimeEqual,
  generateId,
  generateOtp,
  hashPassword,
  hashValue,
  signPayload,
  verifyPassword,
  verifySignature,
} from "@/lib/security/crypto";

describe("crypto helpers", () => {
  it("generates hex ids of fixed length", () => {
    const id = generateId();
    expect(id).toMatch(/^[a-f0-9]{32}$/);
    expect(generateId()).not.toBe(id);
  });

  it("generates 6-digit OTP by default", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
    expect(generateOtp(4)).toMatch(/^\d{4}$/);
  });

  it("hashes values deterministically with sha256", () => {
    expect(hashValue("abc")).toBe(hashValue("abc"));
    expect(hashValue("abc")).not.toBe(hashValue("abd"));
    expect(hashValue("abc")).toHaveLength(64);
  });

  it("hashes and verifies passwords", () => {
    const { hash, salt } = hashPassword("Secret123");
    expect(verifyPassword("Secret123", hash, salt)).toBe(true);
    expect(verifyPassword("Wrong123", hash, salt)).toBe(false);
  });

  it("signs and verifies payloads", () => {
    const sig = signPayload("hello", "secret");
    expect(verifySignature("hello", sig, "secret")).toBe(true);
    expect(verifySignature("hello", sig, "other")).toBe(false);
  });

  it("compares strings in constant time", () => {
    expect(constantTimeEqual("same", "same")).toBe(true);
    expect(constantTimeEqual("same", "diff")).toBe(false);
  });
});
