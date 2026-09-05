import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { tx } from "@/shared/i18n/tx";
import { dispatchWebPush } from "@/services/notifications/web-push-client";
import type { AppNotification, NotificationType } from "@/types/domain/notification";
import { getDurableAuthDir } from "@/services/auth/user-persistence";
import { getOptionalPostgresPool } from "@/services/db/postgres";

const FILE = "sooqna-notifications.json";
const TABLE = "app_notifications";

let postgresReady = false;
let jsonCache: AppNotification[] | null = null;
let jsonChain: Promise<void> = Promise.resolve();

async function ensurePostgres(): Promise<boolean> {
  const pool = await getOptionalPostgresPool();
  if (!pool) return false;
  if (postgresReady) return true;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      title_en TEXT,
      body TEXT NOT NULL,
      body_en TEXT,
      href TEXT,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL,
      dedupe_key TEXT
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS app_notifications_user_idx ON ${TABLE} (user_id, created_at DESC)`,
  );
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS app_notifications_dedupe_idx
     ON ${TABLE} (user_id, dedupe_key)
     WHERE dedupe_key IS NOT NULL`,
  );
  postgresReady = true;
  return true;
}

function rowToNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    orderId: typeof row.order_id === "string" ? row.order_id : undefined,
    type: String(row.type) as NotificationType,
    title: String(row.title),
    titleEn: typeof row.title_en === "string" ? row.title_en : undefined,
    body: String(row.body),
    bodyEn: typeof row.body_en === "string" ? row.body_en : undefined,
    href: typeof row.href === "string" ? row.href : undefined,
    read: Boolean(row.read),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

function filePath(): string {
  return path.join(getDurableAuthDir(), FILE);
}

async function readJson(): Promise<AppNotification[]> {
  if (jsonCache) return jsonCache;
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    jsonCache = Array.isArray(parsed) ? (parsed as AppNotification[]) : [];
  } catch {
    jsonCache = [];
  }
  return jsonCache;
}

async function writeJson(rows: AppNotification[]): Promise<void> {
  const target = filePath();
  await mkdir(path.dirname(target), { recursive: true });
  const payload = JSON.stringify(rows, null, 2);
  const tempPath = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, target);
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

export type CreateNotificationInput = Omit<
  AppNotification,
  "id" | "read" | "createdAt"
> & {
  /** Prevent duplicate in-app alerts for the same business event. */
  dedupeKey?: string;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<AppNotification> {
  const notification: AppNotification = {
    userId: input.userId,
    orderId: input.orderId,
    type: input.type,
    title: input.title,
    titleEn: input.titleEn ?? tx("en", input.title),
    body: input.body,
    bodyEn: input.bodyEn ?? tx("en", input.body),
    href: input.href,
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) throw new Error("NOTIFICATION_STORE_UNAVAILABLE");

    if (input.dedupeKey) {
      const existing = await pool.query(
        `SELECT * FROM ${TABLE} WHERE user_id = $1 AND dedupe_key = $2 LIMIT 1`,
        [input.userId, input.dedupeKey],
      );
      if (existing.rows[0]) {
        return rowToNotification(existing.rows[0]);
      }
    }

    try {
      await pool.query(
        `INSERT INTO ${TABLE} (
          id, user_id, order_id, type, title, title_en, body, body_en, href, read, created_at, dedupe_key
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,$10::timestamptz,$11)`,
        [
          notification.id,
          notification.userId,
          notification.orderId ?? null,
          notification.type,
          notification.title,
          notification.titleEn ?? null,
          notification.body,
          notification.bodyEn ?? null,
          notification.href ?? null,
          notification.createdAt,
          input.dedupeKey ?? null,
        ],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (input.dedupeKey && /unique|duplicate/i.test(message)) {
        const existing = await pool.query(
          `SELECT * FROM ${TABLE} WHERE user_id = $1 AND dedupe_key = $2 LIMIT 1`,
          [input.userId, input.dedupeKey],
        );
        if (existing.rows[0]) return rowToNotification(existing.rows[0]);
      }
      throw error;
    }

    void dispatchWebPush(notification).catch((error) => {
      console.error("[Sooqna Notify] push dispatch failed", error);
    });
    return notification;
  }

  return enqueueJson(async () => {
    const rows = await readJson();
    if (input.dedupeKey) {
      const existing = rows.find(
        (item) =>
          item.userId === input.userId &&
          (item as AppNotification & { dedupeKey?: string }).dedupeKey ===
            input.dedupeKey,
      );
      // Also match by type+href within 24h as soft dedupe for JSON mode
      const soft = rows.find(
        (item) =>
          item.userId === input.userId &&
          item.type === input.type &&
          item.href === input.href &&
          Date.now() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000,
      );
      if (existing || soft) return existing ?? soft!;
    }
    rows.unshift({
      ...notification,
      ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
    } as AppNotification);
    await writeJson(rows.slice(0, 2000));
    void dispatchWebPush(notification).catch((error) => {
      console.error("[Sooqna Notify] push dispatch failed", error);
    });
    return notification;
  });
}

export async function getNotificationsForUser(
  userId: string,
): Promise<AppNotification[]> {
  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return [];
    const result = await pool.query(
      `SELECT * FROM ${TABLE} WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [userId],
    );
    return result.rows.map(rowToNotification);
  }
  const rows = await readJson();
  return rows.filter((item) => item.userId === userId);
}

export async function markNotificationsRead(
  userId: string,
  ids?: string[],
): Promise<number> {
  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return 0;
    if (ids && ids.length > 0) {
      await pool.query(
        `UPDATE ${TABLE} SET read = true WHERE user_id = $1 AND id = ANY($2::text[])`,
        [userId, ids],
      );
    } else {
      await pool.query(
        `UPDATE ${TABLE} SET read = true WHERE user_id = $1 AND read = false`,
        [userId],
      );
    }
    const unread = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TABLE} WHERE user_id = $1 AND read = false`,
      [userId],
    );
    return Number(unread.rows[0]?.c ?? 0);
  }

  return enqueueJson(async () => {
    const notifications = await readJson();
    const idSet = ids && ids.length > 0 ? new Set(ids) : null;
    let changed = false;
    for (const item of notifications) {
      if (item.userId !== userId || item.read) continue;
      if (idSet && !idSet.has(item.id)) continue;
      item.read = true;
      changed = true;
    }
    if (changed) await writeJson(notifications);
    return notifications.filter((item) => item.userId === userId && !item.read)
      .length;
  });
}

export async function getAllNotifications(): Promise<AppNotification[]> {
  if (await ensurePostgres()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return [];
    const result = await pool.query(
      `SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT 500`,
    );
    return result.rows.map(rowToNotification);
  }
  return readJson();
}
