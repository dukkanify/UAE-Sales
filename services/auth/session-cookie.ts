import { cookies, headers } from "next/headers";
import type { UserProfile } from "@/types";
import { getSiteDomain } from "@/shared/constants/site";
import { parseSessionCookieValue } from "@/services/auth/session-cookie-parse";

export const SESSION_COOKIE_NAME = "sooqna_session";
export { parseSessionCookieValue } from "@/services/auth/session-cookie-parse";

type SessionCookieOptions = {
  domain?: string;
  httpOnly: boolean;
  maxAge: number;
  path: string;
  sameSite: "lax";
  secure: boolean;
};

async function resolveCookieDomain(): Promise<string | undefined> {
  const configuredDomain = process.env.SESSION_COOKIE_DOMAIN?.trim();
  if (configuredDomain) return configuredDomain;
  if (process.env.NODE_ENV !== "production") return undefined;

  try {
    const headerStore = await headers();
    const host = (headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "")
      .split(",")[0]
      .trim()
      .split(":")[0]
      .replace(/^www\./i, "")
      .toLowerCase();
    const siteDomain = getSiteDomain().toLowerCase();
    if (host === siteDomain || host.endsWith(`.${siteDomain}`)) {
      return `.${siteDomain}`;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function getSessionCookieOptions(): Promise<SessionCookieOptions> {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = await resolveCookieDomain();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    ...(domain ? { domain } : {}),
  };
}

export async function setSessionCookie(user: UserProfile): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    JSON.stringify(user),
    await getSessionCookieOptions(),
  );
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...(await getSessionCookieOptions()),
    maxAge: 0,
  });
}

export async function getSessionFromCookie(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return parseSessionCookieValue(raw);
}
