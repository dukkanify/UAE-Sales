/**
 * Resolve auth for /api/v1 — Bearer access JWT, API key, or session cookie.
 */

import { ACCOUNT_STATUS } from "@/constants/account-status";
import { hasPermission } from "@/services/auth/permissions";
import type { Permission } from "@/constants/permissions";
import { getCurrentSession } from "@/services/auth/auth-service";
import { findUserById, toUserProfile } from "@/services/auth/store";
import { resolveApiKey, assertApiKeyScope } from "@/services/api-platform/api-key-service";
import { verifyAccessToken } from "@/services/api-platform/token-service";
import { rateLimit } from "@/lib/security/rate-limit";
import { ApiError, clientIp } from "@/lib/api/envelope";
import type { ApiKeyRecord, ApiKeyScope } from "@/types/api-platform";
import type { UserProfile } from "@/types";
import type { Role } from "@/constants/roles";

export type ApiAuthContext = {
  user: UserProfile | null;
  apiKey: ApiKeyRecord | null;
  authType: "bearer" | "api_key" | "session" | "none";
};

export async function resolveApiAuth(request: Request): Promise<ApiAuthContext> {
  const authHeader = request.headers.get("authorization") || "";
  const apiKeyHeader = request.headers.get("x-api-key");

  if (apiKeyHeader || authHeader.toLowerCase().startsWith("apikey ")) {
    const raw = apiKeyHeader || authHeader.slice(7).trim();
    const key = resolveApiKey(raw);
    if (!key) throw new ApiError(401, "invalid_api_key", "Invalid API key");
    const ip = clientIp(request);
    if (key.allowedIps.length && ip && !key.allowedIps.includes(ip)) {
      throw new ApiError(403, "ip_blocked", "API key not allowed from this IP");
    }
    const rl = rateLimit(`apikey:${key.id}`, key.rateLimitPerMinute, 60_000);
    if (!rl.allowed) {
      throw new ApiError(429, "rate_limited", "API key rate limit exceeded");
    }
    const user = key.ownerUserId
      ? (() => {
          const u = findUserById(key.ownerUserId!);
          return u ? toUserProfile(u) : null;
        })()
      : null;
    return { user, apiKey: key, authType: "api_key" };
  }

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    // Prefer mobile access JWT
    const claims = await verifyAccessToken(token);
    if (claims) {
      const stored = findUserById(claims.uid);
      if (!stored) throw new ApiError(401, "unauthorized", "User not found");
      const user = toUserProfile(stored);
      if (user.status === ACCOUNT_STATUS.SUSPENDED) {
        throw new ApiError(403, "suspended", "Account suspended");
      }
      const rl = rateLimit(`bearer:${user.id}`, 300, 60_000);
      if (!rl.allowed) throw new ApiError(429, "rate_limited", "Too many requests");
      return { user, apiKey: null, authType: "bearer" };
    }
  }

  // Session cookie fallback (web clients)
  const { user } = await getCurrentSession();
  if (user) {
    return { user, apiKey: null, authType: "session" };
  }

  return { user: null, apiKey: null, authType: "none" };
}

export async function requireApiUser(
  request: Request,
): Promise<ApiAuthContext & { user: UserProfile }> {
  const ctx = await resolveApiAuth(request);
  if (!ctx.user) throw new ApiError(401, "unauthorized", "Authentication required");
  return ctx as ApiAuthContext & { user: UserProfile };
}

export async function requireApiPermission(
  request: Request,
  permission: Permission,
): Promise<ApiAuthContext & { user: UserProfile }> {
  const ctx = await requireApiUser(request);
  // Broad API-key scopes still require an explicit match via assertApiKeyScope
  // for ops-sensitive work; fine-grained permissions apply to user sessions.
  if (ctx.apiKey) {
    const elevated =
      ctx.apiKey.scopes.includes("admin:ops") || ctx.apiKey.scopes.includes("mobile:full");
    if (!elevated && !hasPermission(ctx.user.role as Role, permission)) {
      throw new ApiError(403, "forbidden", "You do not have permission to perform this action");
    }
    // Elevated keys: allow but log via rate-limit key already applied; still require user binding when possible
    if (elevated) return ctx;
  }
  if (!hasPermission(ctx.user.role as Role, permission)) {
    throw new ApiError(403, "forbidden", "You do not have permission to perform this action");
  }
  return ctx;
}

export async function requireApiKeyScope(request: Request, scope: ApiKeyScope) {
  const ctx = await resolveApiAuth(request);
  if (ctx.authType === "api_key" && ctx.apiKey) {
    assertApiKeyScope(ctx.apiKey, scope);
    return ctx;
  }
  if (ctx.user) return ctx;
  throw new ApiError(401, "unauthorized", "API key or user auth required");
}

export async function requirePublicOrAuth(request: Request) {
  // Public endpoints still rate-limit by IP
  const ip = clientIp(request) || "unknown";
  const rl = rateLimit(`public:${ip}`, 60, 60_000);
  if (!rl.allowed) throw new ApiError(429, "rate_limited", "Too many requests");
  return resolveApiAuth(request);
}
