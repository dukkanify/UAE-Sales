import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { generateToken, hashValue } from "@/lib/security/crypto";
import {
  SESSION_COOKIE,
  CSRF_COOKIE,
  signSessionJwt,
  verifySessionJwt,
  type SessionJwtPayload,
} from "@/lib/security/session-token";

export { SESSION_COOKIE, CSRF_COOKIE, verifySessionJwt };
export type { SessionJwtPayload };

export function hashSessionToken(token: string): string {
  return hashValue(token);
}

export function sessionCookieOptions(maxAgeSeconds: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

function splitSessionCookie(value: string): { jwt: string; rawToken: string } | null {
  const parts = value.split(".");
  // JWT = header.payload.signature (3 parts) + rawToken
  if (parts.length < 4) return null;
  const rawToken = parts[parts.length - 1]!;
  const jwt = parts.slice(0, 3).join(".");
  return { jwt, rawToken };
}

export async function setSessionCookies(
  sessionId: string,
  rawToken: string,
  claims: {
    userId: string;
    role: string;
    status: string;
    profileComplete: boolean;
  },
  maxAgeSeconds: number,
): Promise<void> {
  const jwt = await signSessionJwt(
    {
      sid: sessionId,
      uid: claims.userId,
      th: hashSessionToken(rawToken),
      role: claims.role,
      status: claims.status,
      pc: claims.profileComplete,
    },
    maxAgeSeconds,
  );

  const store = await cookies();
  const opts = sessionCookieOptions(maxAgeSeconds);
  store.set(SESSION_COOKIE, `${jwt}.${rawToken}`, opts);
  // #region agent log
  {
    const { agentLog } = await import("@/lib/debug/agent-log");
    agentLog({
      hypothesisId: "F",
      location: "cookies.ts:setSessionCookies",
      message: "session cookie written",
      data: {
        sessionId,
        userId: claims.userId,
        role: claims.role,
        maxAgeSeconds,
        secure: opts.secure === true,
        path: opts.path,
        sameSite: opts.sameSite,
        nodeEnv: process.env.NODE_ENV ?? null,
        cookieName: SESSION_COOKIE,
        valueParts: `${jwt}.${rawToken}`.split(".").length,
      },
    });
  }
  // #endregion
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  // #region agent log
  {
    const { agentLog } = await import("@/lib/debug/agent-log");
    agentLog({
      hypothesisId: "A",
      location: "cookies.ts:clearSessionCookies",
      message: "session cookie cleared",
      data: { cookieName: SESSION_COOKIE },
    });
  }
  // #endregion
}

export async function readSessionCookie(): Promise<{
  payload: SessionJwtPayload;
  rawToken: string;
} | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const split = splitSessionCookie(value);
  if (!split) {
    // #region agent log
    {
      const { agentLog } = await import("@/lib/debug/agent-log");
      agentLog({
        hypothesisId: "F",
        location: "cookies.ts:readSessionCookie",
        message: "cookie present but split failed",
        data: { parts: value.split(".").length },
      });
    }
    // #endregion
    return null;
  }
  const payload = await verifySessionJwt(split.jwt);
  if (!payload) {
    // #region agent log
    {
      const { agentLog } = await import("@/lib/debug/agent-log");
      agentLog({
        hypothesisId: "F",
        location: "cookies.ts:readSessionCookie",
        message: "jwt verify failed",
        data: { hasJwt: Boolean(split.jwt) },
      });
    }
    // #endregion
    return null;
  }
  return { payload, rawToken: split.rawToken };
}

export async function ensureCsrfToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  const token = generateToken(24);
  store.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return token;
}

export async function validateCsrfHeader(headerValue: string | null): Promise<boolean> {
  if (!headerValue) return false;
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;
  return cookieToken === headerValue;
}
