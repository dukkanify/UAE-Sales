import { cache } from "react";
import {
  marketplaceListings,
  marketplaceUserListings,
} from "@/mock/listings.mock";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type { Listing } from "@/types";
import type { AdminListingPatch, AdminListingRecord } from "@/types/domain/admin";

const FILE = "listings.json";

let cacheRows: Listing[] | null = null;
let inflight: Promise<Listing[]> | null = null;

function seedListings(): Listing[] {
  const byId = new Map<string, Listing>();
  for (const listing of [...marketplaceListings, ...marketplaceUserListings]) {
    byId.set(listing.id, { ...listing });
  }
  // Keep a small moderation backlog for demo ops.
  const seeded = Array.from(byId.values());
  for (const listing of seeded.slice(0, 3)) {
    listing.status = "pending_review";
  }
  return seeded;
}

function cloneListings(listings: Listing[]) {
  return listings.map((listing) => ({ ...listing }));
}

function setCache(listings: Listing[]) {
  cacheRows = cloneListings(listings);
  return cacheRows;
}

async function loadListingsUncached(): Promise<Listing[]> {
  if (cacheRows) return cloneListings(cacheRows);

  if (!inflight) {
    inflight = (async () => {
      const stored = await loadCollection<Listing>(FILE).catch(
        () => [] as Listing[],
      );
      if (stored.length === 0) {
        const seeded = seedListings();
        await saveCollection(FILE, seeded);
        return setCache(seeded);
      }
      return setCache(stored);
    })().finally(() => {
      inflight = null;
    });
  }

  return cloneListings(await inflight);
}

/** Request-deduped catalog read for RSC trees. */
export const getAllListings = cache(async (): Promise<Listing[]> => {
  return loadListingsUncached();
});

/** Sync read for checkout resolvers — uses cache or mock seed fallback. */
export function getListingSync(idOrSlug: string): Listing | undefined {
  const source = cacheRows ?? [...marketplaceListings, ...marketplaceUserListings];
  return source.find(
    (listing) => listing.id === idOrSlug || listing.slug === idOrSlug,
  );
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  const listings = await getAllListings();
  return listings.find((listing) => listing.id === id || listing.slug === id);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  const listings = await getAllListings();
  return listings.find((listing) => listing.slug === slug);
}

export async function upsertListing(listing: Listing): Promise<Listing> {
  const listings = await loadListingsUncached();
  const index = listings.findIndex((item) => item.id === listing.id);
  const next = { ...listing };
  if (index >= 0) listings[index] = next;
  else listings.unshift(next);
  await saveCollection(FILE, listings);
  setCache(listings);
  return { ...next };
}

export async function patchListingRecord(
  id: string,
  patch: AdminListingPatch,
): Promise<Listing | undefined> {
  const listings = await loadListingsUncached();
  const index = listings.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  listings[index] = { ...listings[index], ...patch };
  await saveCollection(FILE, listings);
  setCache(listings);
  return { ...listings[index] };
}

export function toAdminListingRecord(listing: Listing): AdminListingRecord {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    sellerName: listing.seller.name,
    sellerId: listing.seller.id,
    categoryId: listing.categoryId,
    price: listing.price,
    currency: listing.currency,
    status: listing.status,
    isFeatured: listing.isFeatured,
    postedAt: listing.postedAt ?? "",
    city: listing.city,
  };
}

export async function getAdminListingRecords(): Promise<AdminListingRecord[]> {
  const listings = await getAllListings();
  return listings.map(toAdminListingRecord);
}

export async function getListingsModerationSummary() {
  const listings = await getAllListings();
  return {
    totalListings: listings.length,
    pendingListings: listings.filter((item) => item.status === "pending_review").length,
    activeListings: listings.filter((item) => item.status === "active").length,
    featuredListings: listings.filter((item) => item.isFeatured).length,
  };
}
