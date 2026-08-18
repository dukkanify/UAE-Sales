import {
  marketplaceListings,
  marketplaceUserListings,
} from "@/mock/listings.mock";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import {
  computeExpiresAt,
  expireStaleListings,
} from "@/services/listings/listing-expiry";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type { Listing } from "@/types";
import type {
  AdminListingCreateInput,
  AdminListingPatch,
  AdminListingRecord,
} from "@/types/domain/admin";

const FILE = "listings.json";

type CatalogMemory = {
  cacheRows: Listing[] | null;
  expiryApplied: boolean;
  inflight: Promise<Listing[]> | null;
};

function catalogMemory(): CatalogMemory {
  const globalState = globalThis as typeof globalThis & {
    __sooqnaListingCatalog?: CatalogMemory;
  };
  if (!globalState.__sooqnaListingCatalog) {
    globalState.__sooqnaListingCatalog = {
      cacheRows: null,
      expiryApplied: false,
      inflight: null,
    };
  }
  return globalState.__sooqnaListingCatalog;
}

function hydrateCatalogPhones(listings: Listing[]): Listing[] {
  const phones = new Map(
    seedListings()
      .filter((item) => item.contactPhone)
      .map((item) => [item.id, item.contactPhone as string]),
  );
  return listings.map((listing) => {
    if (listing.contactPhone?.trim()) return listing;
    const phone = phones.get(listing.id);
    return phone ? { ...listing, contactPhone: phone } : listing;
  });
}

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

/** Merge newly added mock inventory into an older persisted catalog. */
async function mergeMissingSeedListings(stored: Listing[]): Promise<Listing[]> {
  const seeded = seedListings();
  if (stored.length >= seeded.length) {
    return stored;
  }

  const byId = new Map<string, Listing>();
  for (const listing of stored) {
    byId.set(listing.id, { ...listing });
  }
  for (const listing of seeded) {
    if (!byId.has(listing.id)) {
      byId.set(listing.id, { ...listing });
    }
  }

  const merged = Array.from(byId.values());
  await saveCollection(FILE, merged);
  return merged;
}

function cloneListings(listings: Listing[]) {
  return listings.map((listing) => ({ ...listing }));
}

function setCache(listings: Listing[]) {
  const memory = catalogMemory();
  memory.cacheRows = cloneListings(listings);
  return memory.cacheRows;
}

async function applyListingExpiry(listings: Listing[]): Promise<Listing[]> {
  const memory = catalogMemory();
  if (memory.expiryApplied) return listings;
  memory.expiryApplied = true;
  const settings = await getAdminSettings();
  const changed = expireStaleListings(listings, settings.listingActiveDays);
  if (changed > 0) {
    await saveCollection(FILE, listings);
  }
  return listings;
}

async function loadListingsUncached(): Promise<Listing[]> {
  const memory = catalogMemory();
  if (!memory.inflight) {
    memory.inflight = (async () => {
      const stored = await loadCollection<Listing>(FILE).catch(
        () => [] as Listing[],
      );
      if (stored.length === 0) {
        const seeded = seedListings();
        await applyListingExpiry(seeded);
        await saveCollection(FILE, seeded);
        return setCache(seeded);
      }
      const merged = hydrateCatalogPhones(await mergeMissingSeedListings(stored));
      const phonesAdded = merged.some((listing) => {
        const before = stored.find((item) => item.id === listing.id);
        return Boolean(listing.contactPhone) && !before?.contactPhone;
      });
      if (phonesAdded) {
        await saveCollection(FILE, merged);
      }
      await applyListingExpiry(merged);
      return setCache(merged);
    })().finally(() => {
      catalogMemory().inflight = null;
    });
  }

  return await memory.inflight;
}

/** Shared catalog read. Always goes through the persisted store so API writes show on pages. */
export async function getAllListings(): Promise<Listing[]> {
  return loadListingsUncached();
}

/** Sync read for checkout resolvers — uses cache or mock seed fallback. */
export function getListingSync(idOrSlug: string): Listing | undefined {
  const source =
    catalogMemory().cacheRows ?? [...marketplaceListings, ...marketplaceUserListings];
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

function allocateServerListingId(existing: Listing[]): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = `lst_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    if (!existing.some((item) => item.id === id)) return id;
  }
  return `lst_${Date.now()}_${existing.length}`;
}

function allocateUniqueSlug(title: string, existing: Listing[], currentId?: string): string {
  const base = slugifyTitle(title) || `listing-${Date.now()}`;
  if (!existing.some((item) => item.slug === base && item.id !== currentId)) {
    return base;
  }
  return `${base}-${Date.now().toString(36).slice(-6)}`;
}

export async function upsertListing(listing: Listing): Promise<Listing> {
  const listings = await loadListingsUncached();
  const settings = await getAdminSettings();
  const postedAt = listing.postedAt ?? new Date().toISOString();
  let next: Listing = {
    ...listing,
    postedAt,
    expiresAt:
      listing.expiresAt ??
      computeExpiresAt(postedAt, settings.listingActiveDays),
  };

  let index = listings.findIndex((item) => item.id === listing.id);
  if (index < 0 && listing.id.startsWith("local-")) {
    const bySlug = listings.findIndex(
      (item) => item.slug === listing.slug && item.seller.id === listing.seller.id,
    );
    if (bySlug >= 0) {
      index = bySlug;
      next = { ...listings[index], ...next, id: listings[index].id };
    } else {
      const preferredSlug = listing.slug?.trim();
      const slugTaken = listings.some(
        (item) => item.slug === preferredSlug && item.id !== listing.id,
      );
      next = {
        ...next,
        id: allocateServerListingId(listings),
        slug:
          preferredSlug && !slugTaken
            ? preferredSlug
            : allocateUniqueSlug(listing.title, listings),
      };
    }
  }

  if (index >= 0) listings[index] = next;
  else listings.unshift(next);
  await saveCollection(FILE, listings);
  setCache(listings);
  return { ...next };
}

function slugifyTitle(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return base || `listing-${Date.now()}`;
}

export async function createListingFromAdmin(
  input: AdminListingCreateInput,
): Promise<Listing> {
  const now = Date.now();
  const slugBase = slugifyTitle(input.title);
  const slug = `${slugBase}-${String(now).slice(-5)}`;
  const sellerName = input.sellerName?.trim() || "إدارة سوقنا";
  const city = input.city.trim();
  const emirate = input.emirate?.trim() || city;
  const settings = await getAdminSettings();
  const postedAt = new Date().toISOString();

  const listing: Listing = {
    id: `admin-${now}`,
    slug,
    title: input.title.trim(),
    description:
      input.description?.trim() ||
      `إعلان مضاف من لوحة التحكم: ${input.title.trim()}`,
    categoryId: input.categoryId,
    city,
    emirate,
    area: input.area?.trim() || undefined,
    country: "الإمارات العربية المتحدة",
    price: input.price,
    currency: "AED",
    condition: input.condition ?? "used",
    status: input.status ?? "active",
    isFeatured: Boolean(input.isFeatured),
    isUrgent: Boolean(input.isUrgent),
    views: 0,
    seller: {
      id: "seller-admin-ops",
      name: sellerName,
      rating: 5,
      isVerified: true,
      sellerType: "business",
    },
    verifiedSeller: true,
    escrowAvailable: true,
    postedAt,
    expiresAt: computeExpiresAt(postedAt, settings.listingActiveDays),
    contactMethod: "both",
    contactPhone: input.contactPhone?.trim() || undefined,
    deliveryOption: "both",
    imageTone: "gold",
    categorySpecs: input.categorySpecs,
    features: input.features?.length ? input.features : undefined,
    negotiable: input.negotiable,
  };

  return upsertListing(listing);
}

export async function patchListingRecord(
  id: string,
  patch: AdminListingPatch & Partial<Pick<Listing, "featuredRequested" | "status" | "isFeatured">>,
): Promise<Listing | undefined> {
  const listings = await loadListingsUncached();
  const index = listings.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  listings[index] = { ...listings[index], ...patch };
  await saveCollection(FILE, listings);
  setCache(listings);
  return { ...listings[index] };
}

export async function setListingFeatured(
  id: string,
  featured: boolean,
  days?: number,
): Promise<Listing | undefined> {
  const listings = await loadListingsUncached();
  const index = listings.findIndex((item) => item.id === id);
  if (index < 0) return undefined;

  const settings = days == null ? await getAdminSettings() : null;
  const featureDays = days ?? settings!.featuredListingDays;
  const featuredUntil = featured
    ? computeExpiresAt(new Date().toISOString(), featureDays)
    : undefined;

  listings[index] = {
    ...listings[index],
    isFeatured: featured,
    isPremium: featured ? true : listings[index].isPremium,
    featuredUntil,
  };
  await saveCollection(FILE, listings);
  setCache(listings);
  return { ...listings[index] };
}

export async function renewListing(id: string): Promise<Listing | undefined> {
  const listings = await loadListingsUncached();
  const index = listings.findIndex((item) => item.id === id);
  if (index < 0) return undefined;

  const settings = await getAdminSettings();
  const postedAt = new Date().toISOString();
  listings[index] = {
    ...listings[index],
    postedAt,
    expiresAt: computeExpiresAt(postedAt, settings.listingActiveDays),
    status: "pending_review",
  };
  await saveCollection(FILE, listings);
  setCache(listings);
  return { ...listings[index] };
}

/** Update seller.rating / reviewCount on all listings for a seller. */
export async function updateSellerListingRating(
  sellerId: string,
  average: number,
  reviewCount: number,
): Promise<void> {
  const listings = await loadListingsUncached();
  let changed = false;
  for (let i = 0; i < listings.length; i += 1) {
    if (listings[i].seller.id !== sellerId) continue;
    listings[i] = {
      ...listings[i],
      seller: {
        ...listings[i].seller,
        rating: average,
        reviewCount,
      },
    };
    changed = true;
  }
  if (!changed) return;
  await saveCollection(FILE, listings);
  setCache(listings);
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
