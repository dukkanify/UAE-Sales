/**
 * Next.js middleware — session refresh, maintenance mode, route protection.
 */

import { type NextRequest, NextResponse } from "next/server";

import { publicEnv } from "@/config/env";
import {
  authRoutes,
  protectedRoutes,
  publicSystemRoutes,
  routes,
} from "@/constants/routes";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance mode gate
  if (
    publicEnv.NEXT_PUBLIC_MAINTENANCE_MODE &&
    pathname !== routes.maintenance &&
    !pathname.startsWith("/api/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = routes.maintenance;
    return NextResponse.redirect(url);
  }

  // Skip auth logic for system pages & static assets
  if (
    matchesPrefix(pathname, publicSystemRoutes) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);

  // Foundation mode without Supabase: allow all routes except soft-guard dashboard
  if (!supabase) {
    if (matchesPrefix(pathname, protectedRoutes)) {
      // Soft redirect to login when auth backend is not yet wired
      // Uncomment strict redirect once Supabase is configured:
      // const url = request.nextUrl.clone();
      // url.pathname = routes.login;
      // url.searchParams.set("next", pathname);
      // return NextResponse.redirect(url);
    }
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = matchesPrefix(pathname, protectedRoutes);
  const isAuthRoute = matchesPrefix(pathname, authRoutes);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = routes.dashboard;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
