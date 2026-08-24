import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 64;

export function generateId(): string {
  return randomBytes(16).toString("hex");
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Cryptographically uniform OTP digits (rejection sampling — no modulo bias). */
export function generateOtp(length = 6): string {
  const digits: string[] = [];
  while (digits.length < length) {
    const byte = randomBytes(1)[0]!;
    if (byte >= 250) continue; // reject 250–255 to keep uniform 0–9
    digits.push(String(byte % 10));
  }
  return digits.join("");
}

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Prefer HMAC for OTP codes when a server secret is available. */
export function hashOtp(code: string, secret: string): string {
  return createHmac("sha256", secret).update(`otp:${code}`).digest("hex");
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, usedSalt, SCRYPT_KEYLEN).toString("hex");
  return { hash, salt: usedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const next = scryptSync(password, salt, SCRYPT_KEYLEN);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = signPayload(payload, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
