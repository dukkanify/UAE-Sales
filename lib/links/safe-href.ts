/**
 * Normalize Next.js Link href values so undefined/null/empty never reach <Link>.
 */

import type { UrlObject } from "url";

import { routes } from "@/constants/routes";

export type AppHref = string | UrlObject;

export function isValidHref(href: unknown): href is AppHref {
  if (typeof href === "string") return href.trim().length > 0;
  if (href && typeof href === "object") {
    const obj = href as UrlObject;
    return Boolean(obj.pathname || obj.href || obj.query || obj.hash);
  }
  return false;
}

/** Coerce any dynamic href into a safe Link target. */
export function safeHref(href: unknown, fallback: string = routes.home): string | UrlObject {
  if (isValidHref(href)) {
    if (typeof href === "string") return href.trim();
    return href;
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn("[safeHref] Invalid Link href replaced with fallback:", href);
  }
  return fallback;
}

/** Build a same-origin path; returns fallback when id/slug is missing. */
export function safePath(
  segments: Array<string | number | null | undefined>,
  fallback: string = routes.home,
): string {
  if (segments.some((s) => s === null || s === undefined || s === "")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[safePath] Incomplete path segments:", segments);
    }
    return fallback;
  }
  return (
    "/" +
    segments
      .map((s) => String(s).replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/")
  );
}
