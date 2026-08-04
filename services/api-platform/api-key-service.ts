/**
 * API key management (hashed at rest).
 */

import { generateId, generateToken, hashValue } from "@/lib/security/crypto";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";
import { ApiError } from "@/lib/api/envelope";
import type { ApiKeyRecord, ApiKeyScope } from "@/types/api-platform";

export function listApiKeys() {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().apiKeys.map(sanitizeKey);
}

function sanitizeKey(k: ApiKeyRecord) {
  return {
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    scopes: k.scopes,
    status: k.status,
    ownerUserId: k.ownerUserId,
    rateLimitPerMinute: k.rateLimitPerMinute,
    allowedIps: k.allowedIps,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
    revokedAt: k.revokedAt,
  };
}

export function createApiKey(input: {
  name: string;
  scopes: ApiKeyScope[];
  ownerUserId?: string | null;
  rateLimitPerMinute?: number;
  allowedIps?: string[];
  expiresAt?: string | null;
}) {
  ensureApiPlatformSeeded();
  const raw = `aep_live_${generateToken(24)}`;
  const prefix = raw.slice(0, 16);
  const record: ApiKeyRecord = {
    id: generateId(),
    name: input.name.slice(0, 120),
    keyPrefix: prefix,
    keyHash: hashValue(raw),
    scopes: input.scopes.length ? input.scopes : ["public:read"],
    status: "active",
    ownerUserId: input.ownerUserId ?? null,
    rateLimitPerMinute: input.rateLimitPerMinute ?? 120,
    allowedIps: input.allowedIps ?? [],
    lastUsedAt: null,
    expiresAt: input.expiresAt ?? null,
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };
  const db = ensureApiPlatformStore();
  db.apiKeys.unshift(record);
  writeApiPlatformStore(db);
  return { ...sanitizeKey(record), secret: raw };
}

export function revokeApiKey(id: string) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const key = db.apiKeys.find((k) => k.id === id);
  if (!key) throw new ApiError(404, "not_found", "API key not found");
  key.status = "revoked";
  key.revokedAt = new Date().toISOString();
  writeApiPlatformStore(db);
  return sanitizeKey(key);
}

export function resolveApiKey(raw: string): ApiKeyRecord | null {
  ensureApiPlatformSeeded();
  const hash = hashValue(raw);
  const db = ensureApiPlatformStore();
  const key = db.apiKeys.find((k) => k.keyHash === hash);
  if (!key || key.status !== "active") return null;
  if (key.expiresAt && new Date(key.expiresAt).getTime() < Date.now()) {
    key.status = "expired";
    writeApiPlatformStore(db);
    return null;
  }
  key.lastUsedAt = new Date().toISOString();
  writeApiPlatformStore(db);
  return key;
}

export function assertApiKeyScope(key: ApiKeyRecord, scope: ApiKeyScope) {
  if (key.scopes.includes("admin:ops") || key.scopes.includes("mobile:full")) return;
  if (!key.scopes.includes(scope)) {
    throw new ApiError(403, "scope_denied", `API key missing scope ${scope}`);
  }
}
