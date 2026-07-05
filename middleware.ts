import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_META_COOKIE,
  verifySessionMeta,
} from "@/lib/auth/session-meta";
import { SESSION_COOKIE } from "@/lib/auth/session-constants";
import { shouldValidateCsrf, validateCsrfOrigin } from "@/lib/auth/csrf";

const AUTH_REQUIRED_PREFIXES = [
  "/admin",
  "/chat",
  "/checkout",
  "/dashboard",
  "/disputes/new",
  "/escrow",
  "/listings/new",
  "/notifications",
  "/orders",
  "/profile",
  "/wallet",
];

const AUTH_REQUIRED_PATTERNS = [
  /^\/listings\/[^/]+\/edit$/,
  /^\/listings\/local\/[^/]+\/edit$/,
];

const ADMIN_PREFIX = "/admin";

function isAuthEnforced(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_API === "true" ||
    process.env.NODE_ENV === "production"
  );
}

function isProtectedPath(pathname: string): boolean {
  if (AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return AUTH_REQUIRED_PATTERNS.some((pattern) => pattern.test(pathname));
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", returnPath);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (shouldValidateCsrf(request) && !validateCsrfOrigin(request)) {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          message: "طلب غير مصرح به.",
        },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (!isAuthEnforced() || !isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionMeta = await verifySessionMeta(
    request.cookies.get(SESSION_META_COOKIE)?.value,
  );

  if (!sessionToken || !sessionMeta) {
    return buildLoginRedirect(request);
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (
      pathname !== "/admin/unauthorized" &&
      sessionMeta.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
