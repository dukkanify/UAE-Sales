import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import { findUserById, saveUser } from "@/services/auth/user-store";
import { isAppLocale, LOCALE_COOKIE } from "@/shared/i18n/locale";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;
  const locale = body?.locale;
  if (!isAppLocale(locale)) {
    return NextResponse.json({ error: "INVALID_LOCALE" }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const session = await getSessionFromCookie();
  if (session?.id) {
    const user = await findUserById(session.id);
    if (user) {
      await saveUser({ ...user, preferredLocale: locale });
    }
  }

  return NextResponse.json({ locale });
}
