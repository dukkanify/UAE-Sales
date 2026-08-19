import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getAuthStoreDriver,
  getDurableAuthDir,
  queryAuthPostgres,
} from "@/services/auth/user-persistence";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const TOKEN_FILE = "sooqna-password-reset-tokens.json";

export type PasswordResetTokenStatus = "valid" | "expired" | "invalid";

type StoredResetToken = {
  consumedAt?: string | null;
  createdAt: string;
  expiresAt: string;
  id: string;
  normalizedEmail: string;
  tokenHash: string;
  userId: string;
};

let jsonCache: StoredResetToken[] | null = null;
let jsonPath: string | null = null;
let jsonChain: Promise<void> = Promise.resolve();
let postgresReady = false;

function resetPepper(): string {
  return process.env.PASSWORD_PEPPER ?? "sooqna-password-pepper";
}

export function hashPasswordResetToken(rawToken: string): string {
  return createHash("sha256")
    .update(`reset:${resetPepper()}:${rawToken}`)
    .digest("hex");
}

function hashesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

async function ensurePostgresTable(): Promise<void> {
  if (postgresReady) return;
  await queryAuthPostgres(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      normalized_email TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await queryAuthPostgres(
    `CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens (user_id)`,
  );
  await queryAuthPostgres(
    `CREATE INDEX IF NOT EXISTS password_reset_tokens_hash_idx ON password_reset_tokens (token_hash)`,
  );
  postgresReady = true;
}

function tokenFilePath(): string {
  if (jsonPath) return jsonPath;
  jsonPath = path.join(getDurableAuthDir(), TOKEN_FILE);
  return jsonPath;
}

async function readJsonTokens(): Promise<StoredResetToken[]> {
  if (jsonCache) return jsonCache;
  try {
    const raw = await readFile(tokenFilePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    jsonCache = Array.isArray(parsed) ? (parsed as StoredResetToken[]) : [];
  } catch {
    jsonCache = [];
  }
  return jsonCache;
}

async function writeJsonTokens(tokens: StoredResetToken[]): Promise<void> {
  const filePath = tokenFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const payload = JSON.stringify(tokens, null, 2);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, filePath);
  jsonCache = tokens;
}

function enqueueJson<T>(fn: () => Promise<T>): Promise<T> {
  const run = jsonChain.then(fn, fn);
  jsonChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function rowToToken(row: Record<string, unknown>): StoredResetToken {
  const expiresAt =
    row.expires_at instanceof Date
      ? row.expires_at.toISOString()
      : String(row.expires_at);
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at ?? "");
  const consumedAt =
    row.consumed_at instanceof Date
      ? row.consumed_at.toISOString()
      : row.consumed_at
        ? String(row.consumed_at)
        : null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    normalizedEmail: String(row.normalized_email),
    tokenHash: String(row.token_hash),
    expiresAt,
    createdAt,
    consumedAt,
  };
}

function classifyToken(record: StoredResetToken | null): {
  record: StoredResetToken | null;
  status: PasswordResetTokenStatus;
} {
  if (!record) return { record: null, status: "invalid" };
  if (record.consumedAt) return { record, status: "invalid" };
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return { record, status: "expired" };
  }
  return { record, status: "valid" };
}

async function findByHash(tokenHash: string): Promise<StoredResetToken | null> {
  const driver = await getAuthStoreDriver();
  if (driver === "postgres") {
    await ensurePostgresTable();
    const result = await queryAuthPostgres(
      `SELECT id, user_id, normalized_email, token_hash, expires_at, consumed_at, created_at
       FROM password_reset_tokens
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash],
    );
    return result.rows[0] ? rowToToken(result.rows[0]) : null;
  }

  const tokens = await readJsonTokens();
  return tokens.find((item) => hashesMatch(item.tokenHash, tokenHash)) ?? null;
}

/** Issue a one-time token. Returns the raw token only for the email body — never put it in an API JSON response. */
export async function issuePasswordResetToken(input: {
  email: string;
  userId: string;
}): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const now = new Date();
  const record: StoredResetToken = {
    id: `pwr-${now.getTime()}-${randomBytes(4).toString("hex")}`,
    userId: input.userId,
    normalizedEmail: input.email.trim().toLowerCase(),
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS).toISOString(),
    consumedAt: null,
  };

  const driver = await getAuthStoreDriver();
  if (driver === "postgres") {
    await ensurePostgresTable();
    await queryAuthPostgres(
      `UPDATE password_reset_tokens
       SET consumed_at = NOW()
       WHERE user_id = $1 AND consumed_at IS NULL`,
      [input.userId],
    );
    await queryAuthPostgres(
      `INSERT INTO password_reset_tokens
        (id, user_id, normalized_email, token_hash, expires_at, consumed_at, created_at)
       VALUES ($1, $2, $3, $4, $5::timestamptz, NULL, $6::timestamptz)`,
      [
        record.id,
        record.userId,
        record.normalizedEmail,
        record.tokenHash,
        record.expiresAt,
        record.createdAt,
      ],
    );
    return rawToken;
  }

  await enqueueJson(async () => {
    const tokens = await readJsonTokens();
    const next = tokens.map((item) =>
      item.userId === input.userId && !item.consumedAt
        ? { ...item, consumedAt: now.toISOString() }
        : item,
    );
    next.unshift(record);
    await writeJsonTokens(next.slice(0, 200));
  });
  return rawToken;
}

export async function inspectPasswordResetToken(
  rawToken: string,
): Promise<PasswordResetTokenStatus> {
  if (!rawToken || rawToken.length < 16) return "invalid";
  const found = await findByHash(hashPasswordResetToken(rawToken));
  return classifyToken(found).status;
}

export async function consumePasswordResetToken(rawToken: string): Promise<
  | { ok: true; email: string; userId: string }
  | { ok: false; status: Exclude<PasswordResetTokenStatus, "valid"> }
> {
  if (!rawToken || rawToken.length < 16) {
    return { ok: false, status: "invalid" };
  }

  const tokenHash = hashPasswordResetToken(rawToken);
  const found = await findByHash(tokenHash);
  const classified = classifyToken(found);
  if (!classified.record || classified.status !== "valid") {
    return {
      ok: false,
      status: classified.status === "expired" ? "expired" : "invalid",
    };
  }

  const now = new Date().toISOString();
  const driver = await getAuthStoreDriver();
  if (driver === "postgres") {
    await ensurePostgresTable();
    const updated = await queryAuthPostgres(
      `UPDATE password_reset_tokens
       SET consumed_at = $2::timestamptz
       WHERE id = $1 AND consumed_at IS NULL
       RETURNING id`,
      [classified.record.id, now],
    );
    if (!updated.rows[0]) {
      return { ok: false, status: "invalid" };
    }
  } else {
    await enqueueJson(async () => {
      const tokens = await readJsonTokens();
      await writeJsonTokens(
        tokens.map((item) =>
          item.id === classified.record?.id ? { ...item, consumedAt: now } : item,
        ),
      );
    });
  }

  return {
    ok: true,
    userId: classified.record.userId,
    email: classified.record.normalizedEmail,
  };
}
