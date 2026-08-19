import type { Listing, UserProfile } from "@/types";
import {
  LEGACY_STORAGE_KEYS,
  STORAGE_EVENTS,
  STORAGE_KEYS,
} from "@/shared/constants/brand";
import {
  invalidateFavoritesSnapshot,
  invalidateSessionSnapshot,
} from "@/services/storage/external-store";
import {
  buildSavedSearchUrl,
  dedupeSavedSearches,
  hydrateSavedSearch,
  parseSavedSearchUrl,
  savedSearchFingerprint,
  savedSearchIdFromFingerprint,
  type SavedSearch as SavedSearchRecord,
} from "@/services/saved-searches/identity";

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
  invalidateSessionSnapshot();
  window.dispatchEvent(new Event(STORAGE_EVENTS.sessionChange));
}

export function clearSessionUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.session);
  invalidateSessionSnapshot();
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
  invalidateFavoritesSnapshot();
  window.dispatchEvent(new Event(STORAGE_EVENTS.favoritesChange));
  return !exists;
}

const MAX_RECENT_SEARCHES = 8;

export function getRecentSearches(): string[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.recentSearches);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  if (!canUseStorage()) return;
  const normalized = query.trim();
  if (normalized.length < 2) return;

  const next = [
    normalized,
    ...getRecentSearches().filter(
      (item) => item.toLowerCase() !== normalized.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT_SEARCHES);

  if (!safeSetItem(STORAGE_KEYS.recentSearches, JSON.stringify(next))) return;
  window.dispatchEvent(new Event(STORAGE_EVENTS.recentSearchesChange));
}

export function clearRecentSearches() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEYS.recentSearches);
  window.dispatchEvent(new Event(STORAGE_EVENTS.recentSearchesChange));
}

type AccountProofRecord = {
  email: string;
  passwordHash: string;
  fullName?: string;
  accountType?: UserProfile["accountType"];
};

function getAccountProofs(): AccountProofRecord[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.accountProofs);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AccountProofRecord =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof (item as AccountProofRecord).email === "string" &&
            typeof (item as AccountProofRecord).passwordHash === "string",
        ),
    );
  } catch {
    return [];
  }
}

export function saveAccountProof(input: AccountProofRecord) {
  if (!canUseStorage()) return;
  const email = input.email.trim().toLowerCase();
  if (!email || !input.passwordHash) return;
  const next = [
    { ...input, email },
    ...getAccountProofs().filter((item) => item.email !== email),
  ].slice(0, 12);
  safeSetItem(STORAGE_KEYS.accountProofs, JSON.stringify(next));
}

export function getAccountProof(email: string): AccountProofRecord | null {
  const normalized = email.trim().toLowerCase();
  return getAccountProofs().find((item) => item.email === normalized) ?? null;
}

export type SavedSearch = SavedSearchRecord;

const MAX_SAVED_SEARCHES = 20;

function readSavedSearchesRaw(): unknown[] {
  if (!canUseStorage()) return [];
  ensureMigrated();
  const raw = window.localStorage.getItem(STORAGE_KEYS.savedSearches);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savedSearchSignature(items: SavedSearch[]): string {
  return items.map((item) => `${item.id}:${item.fingerprint}`).join("|");
}

export function getSavedSearches(): SavedSearch[] {
  const hydrated = readSavedSearchesRaw()
    .map(hydrateSavedSearch)
    .filter((item): item is SavedSearch => Boolean(item));
  const cleaned = dedupeSavedSearches(hydrated).slice(0, MAX_SAVED_SEARCHES);
  if (savedSearchSignature(hydrated) !== savedSearchSignature(cleaned)) {
    persistSavedSearches(cleaned);
  }
  return cleaned;
}

function persistSavedSearches(items: SavedSearch[]) {
  if (!canUseStorage()) return;
  if (!safeSetItem(STORAGE_KEYS.savedSearches, JSON.stringify(items))) return;
  window.dispatchEvent(new Event(STORAGE_EVENTS.savedSearchesChange));
}

export function saveCurrentSearch(input: {
  label: string;
  url: string;
  filters?: SavedSearch["filters"];
}): {
  alreadySaved: boolean;
  items: SavedSearch[];
} {
  const fromUrl = parseSavedSearchUrl(input.url);
  const filters = {
    ...fromUrl,
    ...(input.filters ?? {}),
  };
  const fingerprint = savedSearchFingerprint(filters);
  const id = savedSearchIdFromFingerprint(fingerprint);
  const items = getSavedSearches();
  const existing = items.find((item) => item.fingerprint === fingerprint || item.id === id);

  if (existing) {
    const now = new Date().toISOString();
    const updated = [
      { ...existing, lastUsedAt: now },
      ...items.filter((item) => item.id !== existing.id),
    ];
    persistSavedSearches(updated);
    return { alreadySaved: true, items: updated };
  }

  const now = new Date().toISOString();
  const next = hydrateSavedSearch({
    id,
    label: input.label.trim() || "بحث محفوظ",
    url: input.url || buildSavedSearchUrl(filters),
    filters,
    fingerprint,
    createdAt: now,
    lastUsedAt: now,
  });
  if (!next) {
    return { alreadySaved: false, items };
  }

  const updated = [next, ...items].slice(0, MAX_SAVED_SEARCHES);
  persistSavedSearches(updated);
  return { alreadySaved: false, items: updated };
}

export function removeSavedSearch(id: string): SavedSearch[] {
  const updated = getSavedSearches().filter((item) => item.id !== id);
  persistSavedSearches(updated);
  return updated;
}

export function touchSavedSearch(id: string): SavedSearch[] {
  const now = new Date().toISOString();
  const updated = getSavedSearches().map((item) =>
    item.id === id ? { ...item, lastUsedAt: now } : item,
  );
  persistSavedSearches(updated);
  return updated;
}
