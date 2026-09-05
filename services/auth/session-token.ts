import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserProfile } from "@/types";

/** Compact signed session payload — never trust client-supplied profile fields. */
export type SessionTokenPayload = {
  id: string;
  /** sessionVersion at issue time */
  sv: number;
  /** unix seconds expiry */
  exp: number;
  /** role snapshot for edge middleware only; still revalidated server-side */
  role?: UserProfile["role"];
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function sessionSecret(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.PASSWORD_PEPPER?.trim() ||
    "sooqna-dev-session-secret"
  );
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function sign(payloadB64: string): string {
  return b64url(
    createHmac("sha256", sessionSecret()).update(`v1.${payloadB64}`).digest(),
  );
}

export function createSessionToken(
  user: Pick<UserProfile, "id" | "role" | "sessionVersion">,
  ttlSeconds = TOKEN_TTL_SECONDS,
): string {
  const payload: SessionTokenPayload = {
    id: user.id,
    sv: user.sessionVersion ?? 0,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    role: user.role,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `v1.${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(
  raw: string | undefined | null,
): SessionTokenPayload | null {
  if (!raw?.startsWith("v1.")) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [, payloadB64, signature] = parts;
  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromB64url(payloadB64).toString("utf8"),
    ) as SessionTokenPayload;
    if (!payload?.id || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Edge-safe role peek: signed token preferred; legacy JSON fallback during rollout. */
export function peekSessionRoleFromCookieValue(
  raw: string | undefined | null,
): string | null {
  const token = verifySessionToken(raw);
  if (token?.role) return token.role;
  if (!raw) return null;
  try {
    const candidates = [raw];
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded !== raw) candidates.push(decoded);
    } catch {
      // ignore
    }
    for (const candidate of candidates) {
      if (candidate.startsWith("v1.")) continue;
      try {
        const parsed = JSON.parse(candidate) as { role?: string };
        return parsed.role ?? null;
      } catch {
        // try next
      }
    }
  } catch {
    return null;
  }
  return null;
}
