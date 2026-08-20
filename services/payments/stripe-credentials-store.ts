import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { loadRecord, saveRecord } from "@/services/payments/data-store";

export type StripeCredentialSource = "env" | "admin" | "none";

export type StripeCredentialsSnapshot = {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  source: StripeCredentialSource;
  updatedAt?: string;
};

type StoredStripeCredentials = {
  secretKeyEnc?: string;
  publishableKey?: string;
  webhookSecretEnc?: string;
  updatedAt: string;
};

type PostgresPool = {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

const FILE_NAME = "stripe-credentials.json";
const TABLE = "stripe_credentials";

let pool: PostgresPool | null = null;
let memoryCache: StripeCredentialsSnapshot | null = null;
let loadPromise: Promise<StripeCredentialsSnapshot> | null = null;

function getPostgresUrl(): string {
  const direct =
    process.env.DATABASE_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    "";
  if (direct.startsWith("postgres")) return direct;

  const host =
    process.env.DATABASE_PGHOST?.trim() ||
    process.env.DATABASE_PGHOST_UNPOOLED?.trim() ||
    process.env.PGHOST?.trim() ||
    "";
  const user =
    process.env.DATABASE_PGUSER?.trim() ||
    process.env.PGUSER?.trim() ||
    "neondb_owner";
  const password =
    process.env.DATABASE_PGPASSWORD?.trim() ||
    process.env.PGPASSWORD?.trim() ||
    "";
  const database =
    process.env.DATABASE_PGDATABASE?.trim() ||
    process.env.PGDATABASE?.trim() ||
    "neondb";
  const port =
    process.env.DATABASE_PGPORT?.trim() || process.env.PGPORT?.trim() || "5432";

  if (host && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}?sslmode=require`;
  }
  return "";
}

function shouldUseSsl(connectionString: string): boolean {
  if (/localhost|127\.0\.0\.1/i.test(connectionString)) return false;
  if (/sslmode=disable/i.test(connectionString)) return false;
  return (
    process.env.NODE_ENV === "production" ||
    /sslmode=require/i.test(connectionString) ||
    /neon\.tech|supabase\.co|amazonaws\.com/i.test(connectionString)
  );
}

async function getPool(): Promise<PostgresPool | null> {
  const connectionString = getPostgresUrl();
  if (!connectionString) return null;
  if (pool) return pool;
  const pg = await import("pg");
  const created = new pg.Pool({
    connectionString,
    max: 3,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
  pool = {
    query: (sql, params) => created.query(sql, params),
  };
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id TEXT PRIMARY KEY,
      secret_key_enc TEXT,
      publishable_key TEXT,
      webhook_secret_enc TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  return pool;
}

function encryptionKey(): Buffer {
  const material =
    process.env.CREDENTIALS_ENCRYPTION_KEY?.trim() ||
    process.env.STRIPE_CREDENTIALS_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "sooqna-local-dev-credentials";
  return createHash("sha256")
    .update(`sooqna:stripe-credentials:v1:${material}`)
    .digest();
}

function encryptValue(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptValue(payload: string | null | undefined): string | undefined {
  if (!payload?.trim()) return undefined;
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return undefined;
  try {
    const iv = Buffer.from(parts[1], "base64url");
    const tag = Buffer.from(parts[2], "base64url");
    const data = Buffer.from(parts[3], "base64url");
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return undefined;
  }
}

function envSnapshot(): StripeCredentialsSnapshot | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secretKey && !publishableKey && !webhookSecret) return null;
  return {
    secretKey,
    publishableKey,
    webhookSecret,
    source: "env",
  };
}

async function readAdminStored(): Promise<StoredStripeCredentials | null> {
  const pg = await getPool();
  if (pg) {
    const result = await pg.query(
      `SELECT secret_key_enc, publishable_key, webhook_secret_enc, updated_at
       FROM ${TABLE} WHERE id = $1 LIMIT 1`,
      ["default"],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      secretKeyEnc: typeof row.secret_key_enc === "string" ? row.secret_key_enc : undefined,
      publishableKey:
        typeof row.publishable_key === "string" ? row.publishable_key : undefined,
      webhookSecretEnc:
        typeof row.webhook_secret_enc === "string" ? row.webhook_secret_enc : undefined,
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : String(row.updated_at ?? new Date().toISOString()),
    };
  }

  return loadRecord<StoredStripeCredentials>(FILE_NAME).catch(() => null);
}

async function writeAdminStored(value: StoredStripeCredentials | null): Promise<void> {
  const pg = await getPool();
  if (pg) {
    if (!value) {
      await pg.query(`DELETE FROM ${TABLE} WHERE id = $1`, ["default"]);
      return;
    }
    await pg.query(
      `INSERT INTO ${TABLE} (id, secret_key_enc, publishable_key, webhook_secret_enc, updated_at)
       VALUES ($1, $2, $3, $4, $5::timestamptz)
       ON CONFLICT (id) DO UPDATE SET
         secret_key_enc = EXCLUDED.secret_key_enc,
         publishable_key = EXCLUDED.publishable_key,
         webhook_secret_enc = EXCLUDED.webhook_secret_enc,
         updated_at = EXCLUDED.updated_at`,
      [
        "default",
        value.secretKeyEnc ?? null,
        value.publishableKey ?? null,
        value.webhookSecretEnc ?? null,
        value.updatedAt,
      ],
    );
    return;
  }

  if (!value) {
    await saveRecord(FILE_NAME, null);
    return;
  }
  await saveRecord(FILE_NAME, value);
}

function decodeStored(stored: StoredStripeCredentials): StripeCredentialsSnapshot {
  return {
    secretKey: decryptValue(stored.secretKeyEnc),
    publishableKey: stored.publishableKey?.trim() || undefined,
    webhookSecret: decryptValue(stored.webhookSecretEnc),
    source: "admin",
    updatedAt: stored.updatedAt,
  };
}

export function maskSecret(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length < 10) return "••••";
  return `${trimmed.slice(0, 7)}…${trimmed.slice(-4)}`;
}

export async function loadStripeCredentials(
  force = false,
): Promise<StripeCredentialsSnapshot> {
  if (!force && memoryCache) return memoryCache;
  if (!force && loadPromise) return loadPromise;

  loadPromise = (async () => {
    const fromEnv = envSnapshot();
    if (fromEnv?.secretKey) {
      memoryCache = fromEnv;
      return fromEnv;
    }

    const stored = await readAdminStored();
    if (stored) {
      const decoded = decodeStored(stored);
      // Merge env publishable/webhook if only some are set via env.
      memoryCache = {
        secretKey: fromEnv?.secretKey || decoded.secretKey,
        publishableKey: fromEnv?.publishableKey || decoded.publishableKey,
        webhookSecret: fromEnv?.webhookSecret || decoded.webhookSecret,
        source: decoded.secretKey ? "admin" : fromEnv ? "env" : "none",
        updatedAt: decoded.updatedAt,
      };
      return memoryCache;
    }

    memoryCache = fromEnv ?? { source: "none" };
    return memoryCache;
  })();

  try {
    return await loadPromise;
  } finally {
    loadPromise = null;
  }
}

export type SaveStripeCredentialsInput = {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  clearSecret?: boolean;
  clearPublishable?: boolean;
  clearWebhook?: boolean;
};

export function validateStripeSecretKey(value: string): boolean {
  return /^(sk_live_|sk_test_)[A-Za-z0-9]+$/.test(value.trim());
}

export function validateStripePublishableKey(value: string): boolean {
  return /^(pk_live_|pk_test_)[A-Za-z0-9]+$/.test(value.trim());
}

export function validateStripeWebhookSecret(value: string): boolean {
  return /^whsec_[A-Za-z0-9]+$/.test(value.trim());
}

export async function saveStripeCredentials(
  input: SaveStripeCredentialsInput,
): Promise<StripeCredentialsSnapshot> {
  const currentStored = (await readAdminStored()) ?? {
    updatedAt: new Date().toISOString(),
  };

  const next: StoredStripeCredentials = {
    secretKeyEnc: currentStored.secretKeyEnc,
    publishableKey: currentStored.publishableKey,
    webhookSecretEnc: currentStored.webhookSecretEnc,
    updatedAt: new Date().toISOString(),
  };

  if (input.clearSecret) next.secretKeyEnc = undefined;
  if (input.clearPublishable) next.publishableKey = undefined;
  if (input.clearWebhook) next.webhookSecretEnc = undefined;

  if (input.secretKey?.trim()) {
    if (!validateStripeSecretKey(input.secretKey)) {
      throw new Error("INVALID_SECRET_KEY");
    }
    next.secretKeyEnc = encryptValue(input.secretKey.trim());
  }
  if (input.publishableKey?.trim()) {
    if (!validateStripePublishableKey(input.publishableKey)) {
      throw new Error("INVALID_PUBLISHABLE_KEY");
    }
    next.publishableKey = input.publishableKey.trim();
  }
  if (input.webhookSecret?.trim()) {
    if (!validateStripeWebhookSecret(input.webhookSecret)) {
      throw new Error("INVALID_WEBHOOK_SECRET");
    }
    next.webhookSecretEnc = encryptValue(input.webhookSecret.trim());
  }

  const hasAny = Boolean(
    next.secretKeyEnc || next.publishableKey || next.webhookSecretEnc,
  );
  await writeAdminStored(hasAny ? next : null);
  memoryCache = null;
  return loadStripeCredentials(true);
}

export async function clearStripeCredentials(): Promise<StripeCredentialsSnapshot> {
  await writeAdminStored(null);
  memoryCache = null;
  return loadStripeCredentials(true);
}

export function getCachedStripeCredentials(): StripeCredentialsSnapshot | null {
  return memoryCache;
}
