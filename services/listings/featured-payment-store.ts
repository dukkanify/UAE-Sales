import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDurableAuthDir } from "@/services/auth/user-persistence";
import { getOptionalPostgresPool } from "@/services/db/postgres";

export type FeaturedPaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export type FeaturedPaymentRecord = {
  id: string;
  listingId: string;
  userId: string;
  amountAed: number;
  days: number;
  status: FeaturedPaymentStatus;
  stripeSessionId?: string;
  createdAt: string;
  completedAt?: string;
};

const FILE = "sooqna-featured-payments.json";
const TABLE = "featured_payments";

let postgresReady = false;
let jsonCache: FeaturedPaymentRecord[] | null = null;
let jsonChain: Promise<void> = Promise.resolve();

async function ensurePostgres(): Promise<boolean> {
  const pool = await getOptionalPostgresPool();
  if (!pool) return false;
  if (postgresReady) return true;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount_aed NUMERIC NOT NULL,
      days INTEGER NOT NULL,
      status TEXT NOT NULL,
      stripe_session_id TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS featured_payments_session_idx ON ${TABLE} (stripe_session_id)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS featured_payments_listing_idx ON ${TABLE} (listing_id)`,
  );
  postgresReady = true;
  return true;
}

function rowToRecord(row: Record<string, unknown>): FeaturedPaymentRecord {
  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    userId: String(row.user_id),
    amountAed: Number(row.amount_aed),
    days: Number(row.days),
    status: String(row.status) as FeaturedPaymentStatus,
    stripeSessionId:
      typeof row.stripe_session_id === "string" ? row.stripe_session_id : undefined,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    completedAt:
      row.completed_at == null
        ? undefined
        : row.completed_at instanceof Date
          ? row.completed_at.toISOString()
          : String(row.completed_at),
  };
}

function filePath() {
  return path.join(getDurableAuthDir(), FILE);
}

async function readJson(): Promise<FeaturedPaymentRecord[]> {
  if (jsonCache) return jsonCache;
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    jsonCache = Array.isArray(parsed) ? (parsed as FeaturedPaymentRecord[]) : [];
  } catch {
    jsonCache = [];
  }
  return jsonCache;
}

async function writeJson(rows: FeaturedPaymentRecord[]): Promise<void> {
  const target = filePath();
  await mkdir(path.dirname(target), { recursive: true });
  const payload = JSON.stringify(rows, null, 2);
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, payload, "utf8");
  await rename(temp, target);
  jsonCache = rows;
}

function enqueueJson<T>(fn: () => Promise<T>): Promise<T> {
  const run = jsonChain.then(fn, fn);
  jsonChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getFeaturedPayments(): Promise<FeaturedPaymentRecord[]> {
  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return [];
    const result = await pool.query(
      `SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT 500`,
    );
    return result.rows.map(rowToRecord);
  }
  return readJson();
}

export async function recordFeaturedPayment(
  input: Omit<FeaturedPaymentRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): Promise<FeaturedPaymentRecord> {
  const record: FeaturedPaymentRecord = {
    id: input.id ?? `feat-pay-${Date.now()}`,
    listingId: input.listingId,
    userId: input.userId,
    amountAed: input.amountAed,
    days: input.days,
    status: input.status,
    stripeSessionId: input.stripeSessionId,
    createdAt: input.createdAt ?? new Date().toISOString(),
    completedAt: input.completedAt,
  };

  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) throw new Error("FEATURED_PAYMENTS_UNAVAILABLE");
    await pool.query(
      `INSERT INTO ${TABLE} (
        id, listing_id, user_id, amount_aed, days, status,
        stripe_session_id, created_at, completed_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::timestamptz,$9::timestamptz)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        stripe_session_id = COALESCE(EXCLUDED.stripe_session_id, ${TABLE}.stripe_session_id)`,
      [
        record.id,
        record.listingId,
        record.userId,
        record.amountAed,
        record.days,
        record.status,
        record.stripeSessionId ?? null,
        record.createdAt,
        record.completedAt ?? null,
      ],
    );
    return record;
  }

  return enqueueJson(async () => {
    const all = await readJson();
    all.unshift(record);
    await writeJson(all);
    return record;
  });
}

export async function completeFeaturedPaymentBySession(
  sessionId: string,
): Promise<FeaturedPaymentRecord | undefined> {
  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return undefined;
    const existing = await pool.query(
      `SELECT * FROM ${TABLE} WHERE stripe_session_id = $1 LIMIT 1`,
      [sessionId],
    );
    const row = existing.rows[0];
    if (!row) return undefined;
    const current = rowToRecord(row);
    if (current.status === "completed") return current;
    const completedAt = new Date().toISOString();
    await pool.query(
      `UPDATE ${TABLE} SET status = 'completed', completed_at = $1::timestamptz WHERE id = $2`,
      [completedAt, current.id],
    );
    return { ...current, status: "completed", completedAt };
  }

  return enqueueJson(async () => {
    const all = await readJson();
    const index = all.findIndex((item) => item.stripeSessionId === sessionId);
    if (index < 0) return undefined;
    if (all[index].status === "completed") return all[index];
    all[index] = {
      ...all[index],
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    await writeJson(all);
    return all[index];
  });
}
