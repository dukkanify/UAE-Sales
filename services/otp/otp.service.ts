import { createHash, randomInt } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { OtpPurpose, OtpRecord } from "@/types/domain/otp";
import {
  DEMO_OTP_CODE,
  isDemoOtpEnabled,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_PEPPER,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/services/otp/otp-config";
import { getDurableAuthDir } from "@/services/auth/user-persistence";
import { getOptionalPostgresPool } from "@/services/db/postgres";
import { maskEmail } from "@/shared/utils/mask-email";

const FILE = "sooqna-otp-requests.json";
const TABLE = "otp_requests";

let postgresReady = false;
let jsonCache: OtpRecord[] | null = null;
let jsonChain: Promise<void> = Promise.resolve();

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

async function ensurePostgres(): Promise<boolean> {
  const pool = await getOptionalPostgresPool();
  if (!pool) return false;
  if (postgresReady) return true;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      user_id TEXT,
      purpose TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      resend_available_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      metadata JSONB
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS otp_requests_email_purpose_idx ON ${TABLE} (email, purpose)`,
  );
  postgresReady = true;
  return true;
}

function rowToRecord(row: Record<string, unknown>): OtpRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    userId: typeof row.user_id === "string" ? row.user_id : undefined,
    purpose: String(row.purpose) as OtpPurpose,
    otpHash: String(row.otp_hash),
    attempts: Number(row.attempts ?? 0),
    maxAttempts: Number(row.max_attempts ?? OTP_MAX_ATTEMPTS),
    expiresAt:
      row.expires_at instanceof Date
        ? row.expires_at.toISOString()
        : String(row.expires_at),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    resendAvailableAt:
      row.resend_available_at instanceof Date
        ? row.resend_available_at.toISOString()
        : String(row.resend_available_at),
    consumedAt:
      row.consumed_at == null
        ? undefined
        : row.consumed_at instanceof Date
          ? row.consumed_at.toISOString()
          : String(row.consumed_at),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, string>)
        : undefined,
  };
}

function tokenFilePath(): string {
  return path.join(getDurableAuthDir(), FILE);
}

async function readJson(): Promise<OtpRecord[]> {
  if (jsonCache) return jsonCache;
  try {
    const raw = await readFile(tokenFilePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    jsonCache = Array.isArray(parsed) ? (parsed as OtpRecord[]) : [];
  } catch {
    jsonCache = [];
  }
  return jsonCache;
}

async function writeJson(records: OtpRecord[]): Promise<void> {
  const filePath = tokenFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const payload = JSON.stringify(records, null, 2);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, filePath);
  jsonCache = records;
}

function enqueueJson<T>(fn: () => Promise<T>): Promise<T> {
  const run = jsonChain.then(fn, fn);
  jsonChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function cleanupExpired(all: OtpRecord[]): Promise<OtpRecord[]> {
  const now = Date.now();
  return all.filter(
    (item) =>
      !item.consumedAt &&
      new Date(item.expiresAt).getTime() > now - 24 * 60 * 60 * 1000,
  );
}

export async function createOtpRequest(input: {
  email: string;
  purpose: OtpPurpose;
  userId?: string;
  metadata?: Record<string, string>;
}): Promise<{ record: OtpRecord; code: string }> {
  const email = input.email.trim().toLowerCase();
  const now = Date.now();
  const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
  const code = generateOtpCode();
  const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60_000).toISOString();
  const resendAvailableAt = new Date(now + cooldownMs).toISOString();
  const record: OtpRecord = {
    id: `otp-${Date.now()}-${randomInt(1000, 9999)}`,
    email,
    userId: input.userId,
    purpose: input.purpose,
    otpHash: hashOtp(code, email, input.purpose),
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    expiresAt,
    createdAt: new Date(now).toISOString(),
    resendAvailableAt,
    metadata: input.metadata,
  };

  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) throw new Error("OTP_STORE_UNAVAILABLE");

    const active = await pool.query(
      `SELECT * FROM ${TABLE}
       WHERE email = $1 AND purpose = $2 AND consumed_at IS NULL
         AND resend_available_at > NOW()
       LIMIT 1`,
      [email, input.purpose],
    );
    if (active.rows[0]) {
      const existing = rowToRecord(active.rows[0]);
      const waitSeconds = Math.ceil(
        (new Date(existing.resendAvailableAt).getTime() - now) / 1000,
      );
      throw new Error(`RESEND_COOLDOWN:${waitSeconds}`);
    }

    await pool.query(
      `DELETE FROM ${TABLE} WHERE email = $1 AND purpose = $2 AND consumed_at IS NULL`,
      [email, input.purpose],
    );
    await pool.query(
      `INSERT INTO ${TABLE} (
        id, email, user_id, purpose, otp_hash, attempts, max_attempts,
        expires_at, created_at, resend_available_at, metadata
      ) VALUES ($1,$2,$3,$4,$5,0,$6,$7::timestamptz,$8::timestamptz,$9::timestamptz,$10::jsonb)`,
      [
        record.id,
        record.email,
        record.userId ?? null,
        record.purpose,
        record.otpHash,
        record.maxAttempts,
        record.expiresAt,
        record.createdAt,
        record.resendAvailableAt,
        JSON.stringify(record.metadata ?? {}),
      ],
    );
    return { record, code };
  }

  return enqueueJson(async () => {
    const all = await cleanupExpired(await readJson());
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
    const withoutStale = all.filter(
      (item) => !(item.email === email && item.purpose === input.purpose),
    );
    withoutStale.unshift(record);
    await writeJson(withoutStale);
    return { record, code };
  });
}

export type OtpVerifyResult =
  | { ok: true; record: OtpRecord }
  | {
      ok: false;
      reason: "INVALID" | "EXPIRED" | "MAX_ATTEMPTS" | "NOT_FOUND";
      attemptsRemaining?: number;
    };

export async function verifyOtpCode(input: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<OtpVerifyResult> {
  const email = input.email.trim().toLowerCase();

  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return { ok: false, reason: "NOT_FOUND" };
    const result = await pool.query(
      `SELECT * FROM ${TABLE}
       WHERE email = $1 AND purpose = $2 AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [email, input.purpose],
    );
    const row = result.rows[0];
    if (!row) return { ok: false, reason: "NOT_FOUND" };
    const record = rowToRecord(row);

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return { ok: false, reason: "EXPIRED" };
    }
    const maxAttempts = record.maxAttempts ?? OTP_MAX_ATTEMPTS;
    if (record.attempts >= maxAttempts) {
      return { ok: false, reason: "MAX_ATTEMPTS" };
    }

    const expectedHash = hashOtp(input.code, email, input.purpose);
    if (expectedHash !== record.otpHash) {
      const attempts = record.attempts + 1;
      await pool.query(`UPDATE ${TABLE} SET attempts = $1 WHERE id = $2`, [
        attempts,
        record.id,
      ]);
      return {
        ok: false,
        reason: "INVALID",
        attemptsRemaining: Math.max(0, maxAttempts - attempts),
      };
    }

    await pool.query(
      `UPDATE ${TABLE} SET consumed_at = NOW() WHERE id = $1`,
      [record.id],
    );
    return { ok: true, record: { ...record, consumedAt: new Date().toISOString() } };
  }

  return enqueueJson(async () => {
    const all = await readJson();
    const record = all.find(
      (item) =>
        item.email === email && item.purpose === input.purpose && !item.consumedAt,
    );
    if (!record) return { ok: false, reason: "NOT_FOUND" };
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return { ok: false, reason: "EXPIRED" };
    }
    const maxAttempts = record.maxAttempts ?? OTP_MAX_ATTEMPTS;
    if (record.attempts >= maxAttempts) {
      return { ok: false, reason: "MAX_ATTEMPTS" };
    }
    const expectedHash = hashOtp(input.code, email, input.purpose);
    if (expectedHash !== record.otpHash) {
      record.attempts += 1;
      await writeJson(all.map((item) => (item.id === record.id ? record : item)));
      return {
        ok: false,
        reason: "INVALID",
        attemptsRemaining: Math.max(0, maxAttempts - record.attempts),
      };
    }
    record.consumedAt = new Date().toISOString();
    await writeJson(all.map((item) => (item.id === record.id ? record : item)));
    return { ok: true, record };
  });
}

export async function invalidateOtpRecord(recordId: string): Promise<void> {
  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return;
    await pool.query(`DELETE FROM ${TABLE} WHERE id = $1`, [recordId]);
    return;
  }
  await enqueueJson(async () => {
    const all = await readJson();
    await writeJson(all.filter((item) => item.id !== recordId));
  });
}

export { maskEmail };
