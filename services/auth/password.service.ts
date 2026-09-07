import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER ?? "sooqna-password-pepper";

export { isStrongPassword } from "@/shared/utils/password-rules";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(`${PASSWORD_PEPPER}:${password}`, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(`${PASSWORD_PEPPER}:${password}`, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
