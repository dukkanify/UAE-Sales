/**
 * Mobile JWT access + refresh token service.
 */

import { SignJWT, jwtVerify } from "jose";

import { generateId, generateToken, hashValue } from "@/lib/security/crypto";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";
import { findUserById, toUserProfile } from "@/services/auth/store";
import type { UserProfile } from "@/types";
import { ApiError } from "@/lib/api/envelope";

function getUserById(id: string): UserProfile | null {
  const u = findUserById(id);
  return u ? toUserProfile(u) : null;
}

const ACCESS_TTL_SEC = 60 * 15; // 15 minutes
const REFRESH_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

export interface AccessTokenClaims {
  typ: "access";
  uid: string;
  role: string;
  sid: string;
}

function secretKey() {
  const secret = process.env.AUTH_SECRET || "aep-dev-auth-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(user: UserProfile, sessionId: string) {
  return new SignJWT({
    typ: "access",
    uid: user.id,
    role: user.role,
    sid: sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(secretKey());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.typ !== "access") return null;
    if (typeof payload.uid !== "string" || typeof payload.role !== "string") return null;
    return {
      typ: "access",
      uid: payload.uid,
      role: payload.role,
      sid: typeof payload.sid === "string" ? payload.sid : "",
    };
  } catch {
    return null;
  }
}

export async function issueTokenPair(input: {
  user: UserProfile;
  userAgent?: string | null;
  ipAddress?: string | null;
  familyId?: string;
}) {
  ensureApiPlatformSeeded();
  const sessionId = generateId();
  const accessToken = await signAccessToken(input.user, sessionId);
  const rawRefresh = `aep_rt_${generateToken(32)}`;
  const familyId = input.familyId ?? generateId();
  const db = ensureApiPlatformStore();
  db.refreshTokens.unshift({
    id: generateId(),
    userId: input.user.id,
    tokenHash: hashValue(rawRefresh),
    familyId,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SEC * 1000).toISOString(),
    revokedAt: null,
    createdAt: new Date().toISOString(),
    userAgent: input.userAgent ?? null,
    ipAddress: input.ipAddress ?? null,
  });
  writeApiPlatformStore(db);

  return {
    tokenType: "Bearer" as const,
    accessToken,
    accessExpiresIn: ACCESS_TTL_SEC,
    refreshToken: rawRefresh,
    refreshExpiresIn: REFRESH_TTL_SEC,
    user: {
      id: input.user.id,
      email: input.user.email,
      role: input.user.role,
      fullName: input.user.fullName,
      profileComplete: input.user.profileComplete,
    },
  };
}

export async function refreshTokenPair(rawRefresh: string, ctx?: {
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const hash = hashValue(rawRefresh);
  const record = db.refreshTokens.find((t) => t.tokenHash === hash);
  if (!record || record.revokedAt) {
    throw new ApiError(401, "invalid_refresh", "Refresh token invalid or revoked");
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    throw new ApiError(401, "refresh_expired", "Refresh token expired");
  }
  // Rotate: revoke old
  record.revokedAt = new Date().toISOString();
  writeApiPlatformStore(db);

  const user = getUserById(record.userId);
  if (!user) throw new ApiError(401, "user_not_found", "User not found");

  return issueTokenPair({
    user,
    userAgent: ctx?.userAgent,
    ipAddress: ctx?.ipAddress,
    familyId: record.familyId,
  });
}

export function revokeRefreshToken(rawRefresh: string) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const hash = hashValue(rawRefresh);
  const record = db.refreshTokens.find((t) => t.tokenHash === hash);
  if (record && !record.revokedAt) {
    record.revokedAt = new Date().toISOString();
    writeApiPlatformStore(db);
  }
  return { revoked: true };
}

export function revokeRefreshFamily(userId: string, familyId?: string) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const now = new Date().toISOString();
  for (const t of db.refreshTokens) {
    if (t.userId !== userId || t.revokedAt) continue;
    if (familyId && t.familyId !== familyId) continue;
    t.revokedAt = now;
  }
  writeApiPlatformStore(db);
}

export { ACCESS_TTL_SEC, REFRESH_TTL_SEC };
