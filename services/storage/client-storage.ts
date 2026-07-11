import type { Listing, UserProfile } from "@/types";
import {
  LEGACY_STORAGE_KEYS,
  STORAGE_EVENTS,
  STORAGE_KEYS,
} from "@/shared/constants/brand";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function migrateKey(newKey: string, legacyKey: string) {
  if (!canUseStorage()) return;
  const current = window.localStorage.getItem(newKey);
  if (current) return;
  const legacy = window.localStorage.getItem(legacyKey);
  if (legacy) {
    window.localStorage.setItem(newKey, legacy);
    window.localStorage.removeItem(legacyKey);
  }
}

function ensureMigrated() {
  migrateKey(STORAGE_KEYS.session, LEGACY_STORAGE_KEYS.session);
  migrateKey(STORAGE_KEYS.localListings, LEGACY_STORAGE_KEYS.localListings);
  migrateKey(STORAGE_KEYS.recentlyViewed, LEGACY_STORAGE_KEYS.recentlyViewed);
  migrateKey(STORAGE_KEYS.savedSearches, LEGACY_STORAGE_KEYS.savedSearches);
}

export function getSessionUser(): UserProfile | null {
  if (!canUseStorage()) {
    return null;
  }

  ensureMigrated();
  const rawValue = window.localStorage.getItem(STORAGE_KEYS.session);
  return rawValue ? (JSON.parse(rawValue) as UserProfile) : null;
}

function safeSetItem(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function setSessionUser(user: UserProfile) {
  if (!canUseStorage()) {
    return;
  }

  if (!safeSetItem(STORAGE_KEYS.session, JSON.stringify(user))) {
    return;
  }
  window.dispatchEvent(new Event(STORAGE_EVENTS.sessionChange));
}

export function clearSessionUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.session);
  window.dispatchEvent(new Event(STORAGE_EVENTS.sessionChange));
}

export function getLocalListings(): Listing[] {
  if (!canUseStorage()) {
    return [];
  }

  ensureMigrated();
  const rawValue = window.localStorage.getItem(STORAGE_KEYS.localListings);
  return rawValue ? (JSON.parse(rawValue) as Listing[]) : [];
}

export function saveLocalListing(listing: Listing) {
  if (!canUseStorage()) {
    return;
  }

  const listings = getLocalListings();
  const nextListings = [
    listing,
    ...listings.filter((item) => item.id !== listing.id),
  ];

  if (!safeSetItem(STORAGE_KEYS.localListings, JSON.stringify(nextListings))) {
    return;
  }
  window.dispatchEvent(new Event(STORAGE_EVENTS.listingsChange));
}

export function deleteLocalListing(listingId: string) {
  if (!canUseStorage()) {
    return;
  }

  const nextListings = getLocalListings().filter(
    (listing) => listing.id !== listingId,
  );
  if (!safeSetItem(STORAGE_KEYS.localListings, JSON.stringify(nextListings))) {
    return;
  }
  window.dispatchEvent(new Event(STORAGE_EVENTS.listingsChange));
}

export function getLocalListingById(listingId: string) {
  return getLocalListings().find((listing) => listing.id === listingId);
}

export function getLocalListingsForSeller(sellerId: string): Listing[] {
  return getLocalListings().filter((listing) => listing.seller.id === sellerId);
}

export type FavoriteRecord = {
  listingId: string;
  slug: string;
  title: string;
  price: number;
  imageUrl?: string;
  savedAt: string;
};

export function getFavorites(): FavoriteRecord[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.favorites);
  return raw ? (JSON.parse(raw) as FavoriteRecord[]) : [];
}

export function isFavoriteListing(listingId: string): boolean {
  return getFavorites().some((item) => item.listingId === listingId);
}

export function toggleFavorite(entry: FavoriteRecord): boolean {
  if (!canUseStorage()) return false;
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.listingId === entry.listingId);
  const next = exists
    ? favorites.filter((item) => item.listingId !== entry.listingId)
    : [entry, ...favorites];
  if (!safeSetItem(STORAGE_KEYS.favorites, JSON.stringify(next))) return exists;
  window.dispatchEvent(new Event(STORAGE_EVENTS.favoritesChange));
  return !exists;
}
