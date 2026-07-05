import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE, clearSessionCookieOptions, SESSION_COOKIES_TO_CLEAR } from "@/lib/auth/session";
import { handleApiRoute } from "@/lib/api/response";

export async function POST() {
  return handleApiRoute(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ loggedOut: true });
    for (const cookieName of SESSION_COOKIES_TO_CLEAR) {
      response.cookies.set(cookieName, "", clearSessionCookieOptions());
    }

    return response;
  });
}
