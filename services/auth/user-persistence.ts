import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoredUser } from "@/types/domain/user";
import { logProductionConfigIssues } from "@/services/auth/production-config";

const USERS_FILE = "users.json";
const JSON_STORE_FILE = "sooqna-auth-users.json";

export type AuthDriver = "postgres" | "json-file";

export type AuthPersistenceInfo = {
  driver: AuthDriver;
  durable: true;
  location: string;
};

type PostgresPool = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

let driver: AuthDriver | null = null;
let postgresPool: PostgresPool | null = null;
let jsonFilePath: string | null = null;
let jsonCache: StoredUser[] | null = null;
let jsonMutationChain: Promise<void> = Promise.resolve();
let initialized = false;
let migratedFromLegacy = false;
let initPromise: Promise<void> | null = null;

export class AuthStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthStoreError";
  }
}

function getPostgresUrl(): string {
  const direct =
    process.env.DATABASE_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    "";
  if (direct.startsWith("postgres")) return direct;

  // Vercel Neon integration exposes split PG* vars instead of DATABASE_URL.
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
    process.env.DATABASE_PGPORT?.trim() ||
    process.env.PGPORT?.trim() ||
    "5432";

  if (host && password) {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    const encodedDb = encodeURIComponent(database);
    return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${encodedDb}?sslmode=require`;
  }

  return "";
}

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.LAMBDA_TASK_ROOT,
  );
}

function isEphemeralDir(dir: string): boolean {
  const normalized = path.resolve(dir);
  return normalized === "/tmp" || normalized.startsWith("/tmp/");
}

function shouldUsePostgresSsl(connectionString: string): boolean {
  if (/localhost|127\.0\.0\.1/i.test(connectionString)) return false;
  if (/sslmode=disable/i.test(connectionString)) return false;
  return (
    process.env.NODE_ENV === "production" ||
    /sslmode=require/i.test(connectionString) ||
    /neon\.tech|supabase\.co|amazonaws\.com/i.test(connectionString)
  );
}

function resolveDurableJsonDir(): string {
  const configured = process.env.DATA_DIR?.trim();
  if (configured && !isEphemeralDir(configured)) {
    return configured;
  }
  return path.join(process.cwd(), ".data");
}

function legacyJsonCandidatePaths(): string[] {
  const dirs = [
    process.env.DATA_DIR?.trim(),
    path.join(process.cwd(), ".data"),
    path.join("/tmp", "sooqna-data"),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(dirs)].flatMap((dir) => [
    path.join(dir, JSON_STORE_FILE),
    path.join(dir, USERS_FILE),
  ]);
}

async function readJsonUsersFile(filePath: string): Promise<StoredUser[] | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isStoredUserRecord);
  } catch {
    return null;
  }
}

function isStoredUserRecord(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<StoredUser>;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    typeof record.fullName === "string"
  );
}

function normalizeStoredUser(user: StoredUser): StoredUser {
  const email = user.email.trim().toLowerCase();
  const createdAt = user.createdAt ?? user.joinedAt ?? new Date().toISOString();
  return {
    ...user,
    email,
    normalizedEmail: user.normalizedEmail?.trim().toLowerCase() || email,
    createdAt,
    passwordHash: user.passwordHash ?? null,
  };
}

async function writeJsonAtomic(filePath: string, users: StoredUser[]): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const payload = JSON.stringify(users, null, 2);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, filePath);
  const verified = await readFile(filePath, "utf8");
  if (verified !== payload) {
    throw new AuthStoreError("AUTH_STORE_WRITE_VERIFY_FAILED");
  }
}

async function loadLegacyJsonUsers(): Promise<StoredUser[]> {
  const byEmail = new Map<string, StoredUser>();
  for (const candidate of legacyJsonCandidatePaths()) {
    const users = await readJsonUsersFile(candidate);
    if (!users) continue;
    for (const user of users) {
      const normalized = normalizeStoredUser(user);
      const key = normalized.normalizedEmail ?? normalized.email.toLowerCase();
      if (!byEmail.has(key)) {
        byEmail.set(key, normalized);
      }
    }
  }
  return Array.from(byEmail.values());
}

async function getPostgresPool(): Promise<PostgresPool> {
  if (postgresPool) return postgresPool;
  const connectionString = getPostgresUrl();
  const pg = await import("pg");
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    ssl: shouldUsePostgresSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
  postgresPool = {
    query: (sql: string, params?: unknown[]) => pool.query(sql, params),
  };
  return postgresPool;
}

async function runPostgresMigration(pool: PostgresPool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      normalized_email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      account_status TEXT NOT NULL,
      account_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB NOT NULL
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS auth_users_email_idx ON auth_users (normalized_email)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS auth_users_status_idx ON auth_users (account_status)`,
  );
}

function rowToUser(row: Record<string, unknown>): StoredUser {
  const payload =
    typeof row.payload === "string"
      ? (JSON.parse(row.payload) as StoredUser)
      : ((row.payload as StoredUser) ?? ({} as StoredUser));
  const createdAt =
    typeof row.created_at === "string"
      ? row.created_at
      : row.created_at instanceof Date
        ? row.created_at.toISOString()
        : payload.createdAt;
  return normalizeStoredUser({
    ...payload,
    id: String(row.id ?? payload.id),
    email: payload.email,
    normalizedEmail: String(row.normalized_email ?? payload.normalizedEmail ?? payload.email),
    passwordHash:
      typeof row.password_hash === "string" || row.password_hash === null
        ? (row.password_hash as string | null)
        : payload.passwordHash,
    accountStatus: (row.account_status as StoredUser["accountStatus"]) ?? payload.accountStatus,
    accountType: (row.account_type as StoredUser["accountType"]) ?? payload.accountType,
    createdAt,
  });
}

async function importLegacyUsersIntoPostgres(pool: PostgresPool): Promise<void> {
  if (migratedFromLegacy) return;
  const legacy = await loadLegacyJsonUsers();
  for (const user of legacy) {
    const normalized = normalizeStoredUser(user);
    await pool.query(
      `INSERT INTO auth_users
        (id, normalized_email, password_hash, account_status, account_type, created_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::jsonb)
       ON CONFLICT (normalized_email) DO NOTHING`,
      [
        normalized.id,
        normalized.normalizedEmail,
        normalized.passwordHash ?? null,
        normalized.accountStatus ?? "active",
        normalized.accountType,
        normalized.createdAt,
        JSON.stringify(normalized),
      ],
    );
  }
  migratedFromLegacy = true;
}

async function importLegacyUsersIntoJson(filePath: string): Promise<StoredUser[]> {
  const existing = (await readJsonUsersFile(filePath)) ?? [];
  if (existing.length > 0) {
    return existing.map(normalizeStoredUser);
  }
  const legacy = await loadLegacyJsonUsers();
  if (legacy.length === 0) return [];
  await writeJsonAtomic(filePath, legacy);
  return legacy;
}

async function initAuthStore(): Promise<void> {
  if (initialized && driver) return;
  if (!initPromise) {
    initPromise = doInitAuthStore().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  await initPromise;
}

async function doInitAuthStore(): Promise<void> {
  if (initialized && driver) return;

  logProductionConfigIssues("auth-store-init");

  const postgresUrl = getPostgresUrl();
  if (postgresUrl.startsWith("postgres")) {
    const pool = await getPostgresPool();
    await runPostgresMigration(pool);
    await importLegacyUsersIntoPostgres(pool);
    driver = "postgres";
    initialized = true;
    return;
  }

  if (isServerlessRuntime()) {
    throw new AuthStoreError("AUTH_STORE_NOT_DURABLE");
  }

  const dir = resolveDurableJsonDir();
  if (isEphemeralDir(dir)) {
    throw new AuthStoreError("AUTH_STORE_NOT_DURABLE");
  }

  await mkdir(dir, { recursive: true });
  jsonFilePath = path.join(dir, JSON_STORE_FILE);
  jsonCache = await importLegacyUsersIntoJson(jsonFilePath);
  driver = "json-file";
  initialized = true;
}

export async function getAuthPersistenceInfo(): Promise<AuthPersistenceInfo> {
  await initAuthStore();
  if (driver === "postgres") {
    return {
      driver: "postgres",
      durable: true,
      location: "postgres:auth_users",
    };
  }
  return {
    driver: "json-file",
    durable: true,
    location: jsonFilePath ?? path.join(resolveDurableJsonDir(), JSON_STORE_FILE),
  };
}

async function listJsonUsers(): Promise<StoredUser[]> {
  if (jsonCache) return jsonCache;
  if (!jsonFilePath) throw new AuthStoreError("AUTH_STORE_UNAVAILABLE");
  jsonCache = ((await readJsonUsersFile(jsonFilePath)) ?? []).map(normalizeStoredUser);
  return jsonCache;
}

function enqueueJsonMutation<T>(fn: () => Promise<T>): Promise<T> {
  const run = jsonMutationChain.then(fn, fn);
  jsonMutationChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function listPersistedUsers(): Promise<StoredUser[]> {
  await initAuthStore();
  if (driver === "postgres") {
    const pool = await getPostgresPool();
    const result = await pool.query(
      `SELECT id, normalized_email, password_hash, account_status, account_type, created_at, payload
       FROM auth_users
       ORDER BY created_at DESC`,
    );
    return result.rows.map(rowToUser);
  }
  return listJsonUsers();
}

export async function findPersistedUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  await initAuthStore();
  if (driver === "postgres") {
    const pool = await getPostgresPool();
    const result = await pool.query(
      `SELECT id, normalized_email, password_hash, account_status, account_type, created_at, payload
       FROM auth_users
       WHERE normalized_email = $1
       LIMIT 1`,
      [normalized],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }
  const users = await listJsonUsers();
  return (
    users.find(
      (user) =>
        (user.normalizedEmail ?? user.email).toLowerCase() === normalized ||
        user.email.toLowerCase() === normalized,
    ) ?? null
  );
}

export async function findPersistedUserById(id: string): Promise<StoredUser | null> {
  await initAuthStore();
  if (driver === "postgres") {
    const pool = await getPostgresPool();
    const result = await pool.query(
      `SELECT id, normalized_email, password_hash, account_status, account_type, created_at, payload
       FROM auth_users
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }
  const users = await listJsonUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function persistUser(user: StoredUser): Promise<StoredUser> {
  const normalized = normalizeStoredUser(user);
  await initAuthStore();

  if (driver === "postgres") {
    const pool = await getPostgresPool();
    await pool.query(`DELETE FROM auth_users WHERE normalized_email = $1 AND id <> $2`, [
      normalized.normalizedEmail,
      normalized.id,
    ]);
    await pool.query(
      `INSERT INTO auth_users
        (id, normalized_email, password_hash, account_status, account_type, created_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::jsonb)
       ON CONFLICT (id) DO UPDATE SET
        normalized_email = EXCLUDED.normalized_email,
        password_hash = EXCLUDED.password_hash,
        account_status = EXCLUDED.account_status,
        account_type = EXCLUDED.account_type,
        payload = EXCLUDED.payload`,
      [
        normalized.id,
        normalized.normalizedEmail,
        normalized.passwordHash ?? null,
        normalized.accountStatus ?? "active",
        normalized.accountType,
        normalized.createdAt,
        JSON.stringify(normalized),
      ],
    );
    const stored = await findPersistedUserById(normalized.id);
    if (!stored) {
      throw new AuthStoreError("AUTH_STORE_WRITE_VERIFY_FAILED");
    }
    if (normalized.passwordHash && stored.passwordHash !== normalized.passwordHash) {
      throw new AuthStoreError("AUTH_STORE_WRITE_VERIFY_FAILED");
    }
    return stored;
  }

  return enqueueJsonMutation(async () => {
    const users = await listJsonUsers();
    const next = [
      normalized,
      ...users.filter(
        (item) =>
          item.id !== normalized.id &&
          item.email.toLowerCase() !== normalized.email.toLowerCase(),
      ),
    ];
    if (!jsonFilePath) throw new AuthStoreError("AUTH_STORE_UNAVAILABLE");
    await writeJsonAtomic(jsonFilePath, next);
    jsonCache = next;
    const stored = next.find((item) => item.id === normalized.id);
    if (!stored) {
      throw new AuthStoreError("AUTH_STORE_WRITE_VERIFY_FAILED");
    }
    return stored;
  });
}

export async function getAuthStoreDriver(): Promise<AuthDriver> {
  await initAuthStore();
  if (!driver) throw new AuthStoreError("AUTH_STORE_UNAVAILABLE");
  return driver;
}

export async function queryAuthPostgres(
  sql: string,
  params?: unknown[],
): Promise<{ rows: Record<string, unknown>[] }> {
  await initAuthStore();
  if (driver !== "postgres") {
    throw new AuthStoreError("AUTH_STORE_UNAVAILABLE");
  }
  const pool = await getPostgresPool();
  return pool.query(sql, params);
}

export function getDurableAuthDir(): string {
  return resolveDurableJsonDir();
}

export async function deletePersistedUser(id: string): Promise<void> {
  await initAuthStore();
  if (driver === "postgres") {
    const pool = await getPostgresPool();
    await pool.query(`DELETE FROM auth_users WHERE id = $1`, [id]);
    return;
  }
  return enqueueJsonMutation(async () => {
    const users = await listJsonUsers();
    if (!jsonFilePath) throw new AuthStoreError("AUTH_STORE_UNAVAILABLE");
    const next = users.filter((item) => item.id !== id);
    await writeJsonAtomic(jsonFilePath, next);
    jsonCache = next;
  });
}
