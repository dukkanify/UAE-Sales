import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDurableAuthDir } from "@/services/auth/user-persistence";
import { getOptionalPostgresPool } from "@/services/db/postgres";

type PostgresPool = {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

/**
 * Generic durable collection: Postgres JSONB payload table preferred,
 * durable `.data` JSON file locally when Postgres is unavailable.
 */
export function createPayloadCollectionStore<T extends { id: string }>(options: {
  table: string;
  fileName: string;
  orderBySql?: string;
}) {
  const table = options.table;
  const orderBy = options.orderBySql ?? "updated_at DESC NULLS LAST, created_at DESC";
  let postgresReady = false;
  let jsonCache: T[] | null = null;
  let jsonChain: Promise<void> = Promise.resolve();

  async function ensureTable(): Promise<PostgresPool | null> {
    const pool = await getOptionalPostgresPool();
    if (!pool) return null;
    if (!postgresReady) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(
        `CREATE INDEX IF NOT EXISTS ${table}_updated_idx ON ${table} (updated_at DESC)`,
      );
      postgresReady = true;
    }
    return pool;
  }

  function filePath() {
    return path.join(getDurableAuthDir(), options.fileName);
  }

  async function readJson(): Promise<T[]> {
    if (jsonCache) return jsonCache;
    try {
      const raw = await readFile(filePath(), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      jsonCache = Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      jsonCache = [];
    }
    return jsonCache;
  }

  async function writeJson(rows: T[]): Promise<void> {
    const target = filePath();
    await mkdir(path.dirname(target), { recursive: true });
    const payload = JSON.stringify(rows, null, 2);
    const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temp, payload, "utf8");
    await rename(temp, target);
    jsonCache = rows;
  }

  function enqueueJson<R>(fn: () => Promise<R>): Promise<R> {
    const run = jsonChain.then(fn, fn);
    jsonChain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function listAll(): Promise<T[]> {
    const pool = await ensureTable();
    if (pool) {
      const result = await pool.query(
        `SELECT payload FROM ${table} ORDER BY ${orderBy}`,
      );
      return result.rows.map((row) => row.payload as T);
    }
    return readJson();
  }

  async function upsert(item: T): Promise<T> {
    const pool = await ensureTable();
    if (pool) {
      await pool.query(
        `INSERT INTO ${table} (id, payload, created_at, updated_at)
         VALUES ($1, $2::jsonb, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           payload = EXCLUDED.payload,
           updated_at = NOW()`,
        [item.id, JSON.stringify(item)],
      );
      return item;
    }
    return enqueueJson(async () => {
      const rows = await readJson();
      const index = rows.findIndex((row) => row.id === item.id);
      if (index >= 0) rows[index] = item;
      else rows.unshift(item);
      await writeJson(rows);
      return item;
    });
  }

  async function replaceAll(items: T[]): Promise<void> {
    const pool = await ensureTable();
    if (pool) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO ${table} (id, payload, created_at, updated_at)
           VALUES ($1, $2::jsonb, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             payload = EXCLUDED.payload,
             updated_at = NOW()`,
          [item.id, JSON.stringify(item)],
        );
      }
      const ids = items.map((item) => item.id);
      if (ids.length > 0) {
        await pool.query(`DELETE FROM ${table} WHERE NOT (id = ANY($1::text[]))`, [
          ids,
        ]);
      } else {
        await pool.query(`DELETE FROM ${table}`);
      }
      return;
    }
    await enqueueJson(async () => {
      await writeJson(items);
    });
  }

  async function removeById(id: string): Promise<boolean> {
    const pool = await ensureTable();
    if (pool) {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      return (result as { rowCount?: number }).rowCount
        ? Boolean((result as { rowCount?: number }).rowCount)
        : true;
    }
    return enqueueJson(async () => {
      const rows = await readJson();
      const next = rows.filter((row) => row.id !== id);
      if (next.length === rows.length) return false;
      await writeJson(next);
      return true;
    });
  }

  return { listAll, upsert, replaceAll, removeById };
}
