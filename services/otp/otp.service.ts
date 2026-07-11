import { createHash, randomInt } from "node:crypto";
import type { OtpPurpose, OtpRecord } from "@/types/domain/otp";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import {
  DEMO_OTP_CODE,
  isDemoOtpEnabled,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_PEPPER,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/services/otp/otp-config";

const FILE = "otp-requests.json";

function hashOtp(code: string, email: string, purpose: OtpPurpose): string {
  return createHash("sha256")
    .update(`${OTP_PEPPER}:${purpose}:${email.toLowerCase()}:${code}`)
    .digest("hex");
}

function generateOtpCode(): string {
  if (isDemoOtpEnabled()) {
    return DEMO_OTP_CODE;
  }
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function createOtpRequest(input: {
  email: string;
  purpose: OtpPurpose;
  metadata?: Record<string, string>;
}): Promise<{ record: OtpRecord; code: string }> {
  const all = await loadCollection<OtpRecord>(FILE);
  const email = input.email.trim().toLowerCase();
  const now = Date.now();
  const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;

  const active = all.find(
    (item) =>
      item.email === email &&
      item.purpose === input.purpose &&
      !item.consumedAt &&
      new Date(item.resendAvailableAt).getTime() > now,
  );

  if (active) {
    const waitSeconds = Math.ceil(
      (new Date(active.resendAvailableAt).getTime() - now) / 1000,
    );
    throw new Error(`RESEND_COOLDOWN:${waitSeconds}`);
  }

  const code = generateOtpCode();
  const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60_000).toISOString();
  const resendAvailableAt = new Date(now + cooldownMs).toISOString();

  const withoutStale = all.filter(
    (item) => !(item.email === email && item.purpose === input.purpose),
  );

  const record: OtpRecord = {
    id: `otp-${Date.now()}`,
    email,
    purpose: input.purpose,
    codeHash: hashOtp(code, email, input.purpose),
    attempts: 0,
    expiresAt,
    createdAt: new Date(now).toISOString(),
    resendAvailableAt,
    metadata: input.metadata,
  };

  withoutStale.unshift(record);
  await saveCollection(FILE, withoutStale);

  return { record, code };
}

export type OtpVerifyResult =
  | { ok: true; record: OtpRecord }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "MAX_ATTEMPTS" | "NOT_FOUND" };

export async function verifyOtpCode(input: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<OtpVerifyResult> {
  const all = await loadCollection<OtpRecord>(FILE);
  const email = input.email.trim().toLowerCase();
  const record = all.find(
    (item) => item.email === email && item.purpose === input.purpose && !item.consumedAt,
  );

  if (!record) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "EXPIRED" };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "MAX_ATTEMPTS" };
  }

  const expectedHash = hashOtp(input.code, email, input.purpose);
  if (expectedHash !== record.codeHash) {
    record.attempts += 1;
    await saveCollection(
      FILE,
      all.map((item) => (item.id === record.id ? record : item)),
    );
    return { ok: false, reason: "INVALID" };
  }

  record.consumedAt = new Date().toISOString();
  await saveCollection(
    FILE,
    all.map((item) => (item.id === record.id ? record : item)),
  );

  return { ok: true, record };
}

import { maskEmail } from "@/shared/utils/mask-email";

export { maskEmail };
