import type { Pool } from "pg";

type PostgresPool = {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

let pool: PostgresPool | null = null;
let rawPool: Pool | null = null;

export function getPostgresConnectionString(): string {
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

export function isPostgresConfigured(): boolean {
  return Boolean(getPostgresConnectionString());
}

export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.LAMBDA_TASK_ROOT,
  );
}

/** Prefer Postgres; null when unavailable (local JSON fallback allowed). */
export async function getOptionalPostgresPool(): Promise<PostgresPool | null> {
  const connectionString = getPostgresConnectionString();
  if (!connectionString) return null;
  if (pool) return pool;

  const pg = await import("pg");
  rawPool = new pg.Pool({
    connectionString,
    max: 5,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
  pool = {
    query: (sql, params) => rawPool!.query(sql, params),
  };
  return pool;
}

/**
 * Production serverless must use Postgres for critical data.
 * Local/dev may fall back to durable JSON under `.data/`.
 */
export async function requirePostgresPool(
  label = "STORE",
): Promise<PostgresPool> {
  const pg = await getOptionalPostgresPool();
  if (pg) return pg;
  if (isServerlessRuntime() || process.env.NODE_ENV === "production") {
    throw new Error(`${label}_REQUIRES_POSTGRES`);
  }
  throw new Error(`${label}_POSTGRES_UNAVAILABLE`);
}
