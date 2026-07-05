import type { UserRole } from "@prisma/client";

export const SESSION_META_COOKIE = "uae-sales-session-meta";

export type SessionMetaPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production (min 32 chars).");
  }

  return "dev-only-insecure-session-secret-change-me";
}

async function importKey(secret: string) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(padded + "=".repeat(padLength));
}

export async function signSessionMeta(
  payload: SessionMetaPayload,
): Promise<string> {
  const key = await importKey(getSessionSecret());
  const encoder = new TextEncoder();
  const body = JSON.stringify(payload);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const signatureBytes = new Uint8Array(signature);
  const signatureString = String.fromCharCode(...signatureBytes);

  return `${toBase64Url(body)}.${toBase64Url(signatureString)}`;
}

export async function verifySessionMeta(
  token: string | undefined,
): Promise<SessionMetaPayload | null> {
  if (!token) {
    return null;
  }

  const [encodedBody, encodedSignature] = token.split(".");
  if (!encodedBody || !encodedSignature) {
    return null;
  }

  try {
    const key = await importKey(getSessionSecret());
    const encoder = new TextEncoder();
    const body = fromBase64Url(encodedBody);
    const signature = Uint8Array.from(fromBase64Url(encodedSignature), (char) =>
      char.charCodeAt(0),
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(body),
    );

    if (!valid) {
      return null;
    }

    const payload = JSON.parse(body) as SessionMetaPayload;
    if (!payload.userId || !payload.role || !payload.exp) {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
