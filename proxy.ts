import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/services/auth/session-cookie";

const APEX_HOST = "sooqna.site";

function readSessionRole(request: NextRequest): string | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { role?: string };
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest, nextPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(nextPath)}`;
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isProduction = process.env.NODE_ENV === "production";
  const { pathname } = request.nextUrl;

  if (isProduction && host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = APEX_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (isProduction && forwardedProto === "http") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // Admin requires login immediately — no flash of the control panel.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const role = readSessionRole(request);
    if (!role) {
      return redirectToLogin(request, `${pathname}${request.nextUrl.search}`);
    }
  }

  const response = NextResponse.next();

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|brand/).*)",
  ],
};
