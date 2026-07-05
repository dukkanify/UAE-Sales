import type { Listing, UserProfile } from "@/types";

const SESSION_KEY = "uae-sales-session";
const AUTH_TOKEN_KEY = "uae-sales-auth-token";
const LOCAL_LISTINGS_KEY = "uae-sales-local-listings";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getSessionUser(): UserProfile | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(SESSION_KEY);
  return rawValue ? (JSON.parse(rawValue) as UserProfile) : null;
}

export function setSessionUser(user: UserProfile) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("uae-sales-session-change"));
}

export function clearSessionUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event("uae-sales-session-change"));
}

export function setAuthToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getLocalListings(): Listing[] {
  if (!canUseStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(LOCAL_LISTINGS_KEY);
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

  window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextListings));
  window.dispatchEvent(new Event("uae-sales-listings-change"));
}

export function deleteLocalListing(listingId: string) {
  if (!canUseStorage()) {
    return;
  }

  const nextListings = getLocalListings().filter(
    (listing) => listing.id !== listingId,
  );
  window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextListings));
  window.dispatchEvent(new Event("uae-sales-listings-change"));
}

export function getLocalListingById(listingId: string) {
  return getLocalListings().find((listing) => listing.id === listingId);
}
