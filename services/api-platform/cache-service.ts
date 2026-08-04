/**
 * Platform API cache (TTL + tag invalidation).
 */

import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
  tags: string[];
}

const memory = new Map<string, MemoryEntry>();

export function cacheGet<T>(key: string): T | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet(key: string, value: unknown, ttlSeconds: number, tags: string[] = []) {
  ensureApiPlatformSeeded();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memory.set(key, { value, expiresAt, tags });
  const db = ensureApiPlatformStore();
  const existing = db.cacheMeta.findIndex((c) => c.key === key);
  const meta = {
    key,
    tags,
    expiresAt: new Date(expiresAt).toISOString(),
    createdAt: new Date().toISOString(),
  };
  if (existing >= 0) db.cacheMeta[existing] = meta;
  else db.cacheMeta.unshift(meta);
  if (db.cacheMeta.length > 500) db.cacheMeta = db.cacheMeta.slice(0, 500);
  writeApiPlatformStore(db);
}

export function cacheInvalidate(tagOrKey: string) {
  for (const [key, entry] of memory.entries()) {
    if (key === tagOrKey || entry.tags.includes(tagOrKey)) memory.delete(key);
  }
  const db = ensureApiPlatformStore();
  db.cacheMeta = db.cacheMeta.filter(
    (c) => c.key !== tagOrKey && !c.tags.includes(tagOrKey),
  );
  writeApiPlatformStore(db);
}

export function cacheWrap<T>(
  key: string,
  ttlSeconds: number,
  tags: string[],
  fn: () => T,
): T {
  const hit = cacheGet<T>(key);
  if (hit != null) return hit;
  const value = fn();
  cacheSet(key, value, ttlSeconds, tags);
  return value;
}

export function listCacheMeta(limit = 50) {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().cacheMeta.slice(0, limit);
}
