/**
 * Auth route helpers for middleware composition.
 */

import type { NextRequest } from "next/server";

import { authRoutes, protectedRoutes } from "@/constants/routes";

export function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function getRedirectPath(request: NextRequest): string | null {
  return request.nextUrl.searchParams.get("next");
}
