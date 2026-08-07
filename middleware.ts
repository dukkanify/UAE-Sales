/**
 * Next.js middleware — session gate, role routing, maintenance mode.
 */

import { type NextRequest, NextResponse } from "next/server";

import { publicEnv } from "@/config/env";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import {
  authRoutes,
  protectedRoutePrefixes,
  publicSystemRoutes,
  ROLE_ROUTE_GUARDS,
  routes,
} from "@/constants/routes";
import { ROLE_DASHBOARD, type Role } from "@/constants/roles";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/security/session-token";

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function readClaims(request: NextRequest): Promise<{
  userId: string;
  sessionId: string;
  role: Role;
  status: string;
  profileComplete: boolean;
} | null> {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length < 4) return null;
  const jwt = parts.slice(0, 3).join(".");
  const payload = await verifySessionJwt(jwt);
  if (!payload) return null;

  return {
    userId: payload.uid,
    sessionId: payload.sid,
    role: payload.role as Role,
    status: payload.status,
    profileComplete: payload.pc,
  };
}

async function isMaintenanceEnabled(request: NextRequest): Promise<boolean> {
  if (publicEnv.NEXT_PUBLIC_MAINTENANCE_MODE) return true;
  try {
    const statusUrl = new URL("/api/public/maintenance", request.nextUrl.origin);
    const res = await fetch(statusUrl, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: { enabled?: boolean } };
    return Boolean(json.data?.enabled);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Browsers / autocomplete sometimes hit /BOOK — canonicalize known public paths.
  if (pathname !== pathname.toLowerCase()) {
    const lower = pathname.toLowerCase();
    if (
      lower === "/book" ||
      lower === "/courses" ||
      lower === "/login" ||
      lower === "/register" ||
      lower === "/register/instructor" ||
      lower === "/verify-otp"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = lower;
      return NextResponse.redirect(url);
    }
  }

  if (
    matchesPrefix(pathname, publicSystemRoutes) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const claims = await readClaims(request);

  // Settings- or env-driven maintenance — Super Admins may still access the console.
  if (
    pathname !== routes.maintenance &&
    !pathname.startsWith("/api/") &&
    claims?.role !== "super_admin"
  ) {
    const maintenanceOn = await isMaintenanceEnabled(request);
    if (maintenanceOn) {
      const url = request.nextUrl.clone();
      url.pathname = routes.maintenance;
      return NextResponse.redirect(url);
    }
  }
  const isProtected = matchesPrefix(pathname, protectedRoutePrefixes);
  const isAuthRoute = matchesPrefix(pathname, authRoutes);

  if (isProtected && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (claims?.status === ACCOUNT_STATUS.SUSPENDED && pathname !== routes.accountSuspended) {
    const url = request.nextUrl.clone();
    url.pathname = routes.accountSuspended;
    return NextResponse.redirect(url);
  }

  // Instructors awaiting admin approval cannot enter the teaching console yet.
  if (
    claims?.role === "instructor" &&
    claims.status === ACCOUNT_STATUS.PENDING &&
    (pathname === "/instructor" || pathname.startsWith("/instructor/")) &&
    pathname !== routes.instructorPending
  ) {
    const url = request.nextUrl.clone();
    url.pathname = routes.instructorPending;
    return NextResponse.redirect(url);
  }

  if (claims && !claims.profileComplete && pathname !== routes.completeProfile && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = routes.completeProfile;
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && claims && claims.status !== ACCOUNT_STATUS.SUSPENDED) {
    const url = request.nextUrl.clone();
    url.pathname = claims.profileComplete ? ROLE_DASHBOARD[claims.role] : routes.completeProfile;
    return NextResponse.redirect(url);
  }

  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTE_GUARDS)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!claims) {
        const url = request.nextUrl.clone();
        url.pathname = routes.login;
        return NextResponse.redirect(url);
      }
      if (claims.role !== requiredRole) {
        if (!(requiredRole === "admin" && claims.role === "super_admin")) {
          const url = request.nextUrl.clone();
          url.pathname = routes.accessDenied;
          return NextResponse.redirect(url);
        }
      }
    }
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!claims) {
      const url = request.nextUrl.clone();
      url.pathname = routes.login;
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = ROLE_DASHBOARD[claims.role];
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
