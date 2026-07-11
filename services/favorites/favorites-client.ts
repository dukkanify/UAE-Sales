"use client";

import type { FavoriteRecord } from "@/services/storage/client-storage";

const API_OPTIONS: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

let syncInFlight: Promise<void> | null = null;
let lastSyncedUserId: string | null = null;

export async function fetchServerFavorites() {
  const response = await fetch("/api/favorites", {
    ...API_OPTIONS,
    method: "GET",
  });
  if (!response.ok) return null;
  const data = await response.json();
  return (data.favorites ?? []) as Array<{
    listingId: string;
    slug: string;
    title: string;
    price: number;
    imageUrl?: string;
    savedAt: string;
  }>;
}

export async function addServerFavorite(entry: Omit<FavoriteRecord, "savedAt">) {
  const response = await fetch("/api/favorites", {
    ...API_OPTIONS,
    method: "POST",
    body: JSON.stringify(entry),
  });
  return response.ok;
}

export async function removeServerFavorite(listingId: string) {
  const response = await fetch(`/api/favorites/${encodeURIComponent(listingId)}`, {
    ...API_OPTIONS,
    method: "DELETE",
  });
  return response.ok;
}

export async function syncFavoritesAfterLogin(userId: string) {
  if (typeof window === "undefined") return;
  if (lastSyncedUserId === userId) return;
  if (syncInFlight) {
    await syncInFlight;
    return;
  }

  syncInFlight = (async () => {
    const { STORAGE_KEYS, STORAGE_EVENTS } = await import("@/shared/constants/brand");
    const { invalidateFavoritesSnapshot } = await import(
      "@/services/storage/external-store"
    );
    const localRaw = window.localStorage.getItem(STORAGE_KEYS.favorites);
    const local = localRaw ? (JSON.parse(localRaw) as FavoriteRecord[]) : [];

    const response = await fetch("/api/favorites", {
      ...API_OPTIONS,
      method: "POST",
      body: JSON.stringify({
        sync: true,
        favorites: local.map((item) => ({
          listingId: item.listingId,
          slug: item.slug,
          title: item.title,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
      }),
    });

    if (!response.ok) return;

    const data = await response.json();
    const merged: FavoriteRecord[] = (data.favorites ?? []).map(
      (item: FavoriteRecord) => ({
        listingId: item.listingId,
        slug: item.slug,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        savedAt: item.savedAt,
      }),
    );

    window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(merged));
    invalidateFavoritesSnapshot();
    window.dispatchEvent(new Event(STORAGE_EVENTS.favoritesChange));
    lastSyncedUserId = userId;
  })();

  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}
