"use client";

import type { SavedSearch } from "@/services/saved-searches/identity";

const API_OPTIONS: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

let syncInFlight: Promise<void> | null = null;
let lastSyncedUserId: string | null = null;

export async function fetchServerSavedSearches(): Promise<SavedSearch[] | null> {
  const response = await fetch("/api/saved-searches", {
    ...API_OPTIONS,
    method: "GET",
  });
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data.searches) ? (data.searches as SavedSearch[]) : [];
}

export async function addServerSavedSearch(input: {
  label: string;
  url: string;
  query?: string;
  filters?: SavedSearch["filters"];
}): Promise<{ search: SavedSearch; alreadySaved: boolean } | null> {
  const response = await fetch("/api/saved-searches", {
    ...API_OPTIONS,
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function removeServerSavedSearch(id: string): Promise<boolean> {
  const response = await fetch(`/api/saved-searches/${encodeURIComponent(id)}`, {
    ...API_OPTIONS,
    method: "DELETE",
  });
  return response.ok || response.status === 404;
}

export async function syncSavedSearchesAfterLogin(userId: string) {
  if (typeof window === "undefined") return;
  if (lastSyncedUserId === userId) return;
  if (syncInFlight) {
    await syncInFlight;
    return;
  }

  syncInFlight = (async () => {
    const { STORAGE_KEYS, STORAGE_EVENTS } = await import("@/shared/constants/brand");
    const { hydrateSavedSearch, dedupeSavedSearches } = await import(
      "@/services/saved-searches/identity"
    );

    const localRaw = window.localStorage.getItem(STORAGE_KEYS.savedSearches);
    const localParsed = localRaw ? (JSON.parse(localRaw) as unknown[]) : [];
    const local = dedupeSavedSearches(
      localParsed
        .map((item: unknown) => hydrateSavedSearch(item))
        .filter((item: SavedSearch | null): item is SavedSearch => Boolean(item)),
    );

    const response = await fetch("/api/saved-searches", {
      ...API_OPTIONS,
      method: "POST",
      body: JSON.stringify({
        sync: true,
        searches: local,
      }),
    });

    if (!response.ok) return;

    const data = await response.json();
    const merged = dedupeSavedSearches(
      (Array.isArray(data.searches) ? data.searches : []).map((item: unknown) =>
        hydrateSavedSearch(item),
      ).filter((item: SavedSearch | null): item is SavedSearch => Boolean(item)),
    );

    window.localStorage.setItem(STORAGE_KEYS.savedSearches, JSON.stringify(merged));
    window.dispatchEvent(new Event(STORAGE_EVENTS.savedSearchesChange));
    lastSyncedUserId = userId;
  })();

  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}
