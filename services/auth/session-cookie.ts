import { cookies } from "next/headers";
import type { UserProfile } from "@/types";
import { getSiteDomain } from "@/shared/constants/site";

export const SESSION_COOKIE_NAME = "sooqna_session";

type SessionCookieOptions = {
  domain?: string;
  httpOnly: boolean;
  maxAge: number;
  path: string;
  sameSite: "lax";
  secure: boolean;
};

export function getSessionCookieOptions(): SessionCookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredDomain = process.env.SESSION_COOKIE_DOMAIN?.trim();
  const domain =
    configuredDomain || (isProduction ? `.${getSiteDomain()}` : undefined);

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
    getSessionCookieOptions(),
  );
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function getSessionFromCookie(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
