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

export function setSessionUser(user: UserProfile) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
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

  window.localStorage.setItem(STORAGE_KEYS.localListings, JSON.stringify(nextListings));
  window.dispatchEvent(new Event(STORAGE_EVENTS.listingsChange));
}

export function deleteLocalListing(listingId: string) {
  if (!canUseStorage()) {
    return;
  }

  const nextListings = getLocalListings().filter(
    (listing) => listing.id !== listingId,
  );
  window.localStorage.setItem(STORAGE_KEYS.localListings, JSON.stringify(nextListings));
  window.dispatchEvent(new Event(STORAGE_EVENTS.listingsChange));
}

export function getLocalListingById(listingId: string) {
  return getLocalListings().find((listing) => listing.id === listingId);
}

export function getLocalListingsForSeller(sellerId: string): Listing[] {
  return getLocalListings().filter((listing) => listing.seller.id === sellerId);
}
