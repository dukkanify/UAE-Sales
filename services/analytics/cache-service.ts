/**
 * Short-lived analytics cache (materialized snapshot twin).
 */

import { readAnalyticsDb, writeAnalyticsDb } from "@/services/analytics/store";

export function getCached<T>(key: string): T | null {
  const row = readAnalyticsDb().cache.find((c) => c.key === key);
  if (!row) return null;
  if (row.expiresAt < new Date().toISOString()) {
    writeAnalyticsDb((db) => {
      db.cache = db.cache.filter((c) => c.key !== key);
    });
    return null;
  }
  return row.payload as T;
}

export function setCached(key: string, payload: unknown, ttlSeconds = 60) {
  const now = new Date();
  const expires = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
  writeAnalyticsDb((db) => {
    const existing = db.cache.find((c) => c.key === key);
    if (existing) {
      existing.payload = payload;
      existing.expiresAt = expires;
      existing.updatedAt = now.toISOString();
    } else {
      db.cache.push({
        key,
        payload,
        expiresAt: expires,
        updatedAt: now.toISOString(),
      });
    }
    // Cap cache size
    if (db.cache.length > 80) {
      db.cache = db.cache
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 60);
    }
  });
}

export function clearAnalyticsCache(prefix?: string) {
  writeAnalyticsDb((db) => {
    db.cache = prefix
      ? db.cache.filter((c) => !c.key.startsWith(prefix))
      : [];
  });
}
