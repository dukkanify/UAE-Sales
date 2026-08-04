/**
 * Temporary signed download URLs for private/local uploads.
 */

import { createHmac, timingSafeEqual } from "crypto";

import { getServerEnv } from "@/config/env";

export function signDownloadToken(input: {
  path: string;
  expiresAt: number;
  userId: string;
}): string {
  const secret = getServerEnv().AUTH_SECRET;
  const payload = `${input.path}|${input.expiresAt}|${input.userId}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyDownloadToken(token: string): {
  path: string;
  expiresAt: number;
  userId: string;
} | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split("|");
    if (parts.length !== 4) return null;
    const [filePath, expStr, userId, sig] = parts as [string, string, string, string];
    const expiresAt = Number(expStr);
    if (!filePath || !userId || Number.isNaN(expiresAt)) return null;
    if (Date.now() > expiresAt) return null;
    const secret = getServerEnv().AUTH_SECRET;
    const expected = createHmac("sha256", secret)
      .update(`${filePath}|${expiresAt}|${userId}`)
      .digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (filePath.includes("..") || filePath.startsWith("/")) return null;
    return { path: filePath, expiresAt, userId };
  } catch {
    return null;
  }
}

export function createTemporaryDownloadUrl(input: {
  relativePath: string;
  userId: string;
  ttlSeconds?: number;
}): { url: string; expiresAt: string } {
  const ttl = input.ttlSeconds ?? 300;
  const expiresAt = Date.now() + ttl * 1000;
  const token = signDownloadToken({
    path: input.relativePath.replace(/^\/+/, ""),
    expiresAt,
    userId: input.userId,
  });
  return {
    url: `/api/ops/download?token=${encodeURIComponent(token)}`,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}
