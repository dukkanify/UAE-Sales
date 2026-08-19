import type { Listing } from "@/types";

function addDaysIso(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

/**
 * Mark active listings as expired when postedAt is older than `days`.
 * Mutates the given array in place and returns how many were expired.
 */
export function expireStaleListings(listings: Listing[], days: number): number {
  const cutoffMs = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000;
  let changed = 0;

  for (const listing of listings) {
    if (listing.status !== "active") continue;
    const postedAt = listing.postedAt;
    if (!postedAt) continue;
    const postedMs = new Date(postedAt).getTime();
    if (!Number.isFinite(postedMs) || postedMs > cutoffMs) continue;

    listing.status = "expired";
    listing.expiresAt = listing.expiresAt ?? addDaysIso(postedAt, days);
    changed += 1;
  }

  return changed;
}

export function expireFeaturedListings(listings: Listing[]): Listing[] {
  const now = Date.now();
  const expired: Listing[] = [];
  for (const listing of listings) {
    if (!listing.isFeatured || !listing.featuredUntil) continue;
    const until = new Date(listing.featuredUntil).getTime();
    if (!Number.isFinite(until) || until > now) continue;
    expired.push({ ...listing });
    listing.isFeatured = false;
    listing.featuredUntil = undefined;
  }
  return expired;
}

export function computeExpiresAt(postedAt: string, days: number): string {
  return addDaysIso(postedAt, Math.max(1, days));
}
