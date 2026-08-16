import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "aep_session";
/** Non-httpOnly hint so the client can skip /api/auth/me when signed out. */
export const SESSION_HINT_COOKIE = "aep_signed_in";
export const CSRF_COOKIE = "aep_csrf";

export interface SessionJwtPayload {
  sid: string; // session id
  uid: string; // user id
  th: string; // token hash
  role: string;
  status: string;
  pc: boolean; // profile complete
}

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || "aep-dev-auth-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function signSessionJwt(
  payload: SessionJwtPayload,
  maxAgeSeconds: number,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecretKey());
}

export async function verifySessionJwt(
  token: string | undefined,
): Promise<SessionJwtPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sid !== "string" ||
      typeof payload.uid !== "string" ||
      typeof payload.th !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.status !== "string"
    ) {
      return null;
    }
    return {
      sid: payload.sid,
      uid: payload.uid,
      th: payload.th,
      role: payload.role,
      status: payload.status,
      pc: Boolean(payload.pc),
    };
  } catch {
    return null;
  }
}
