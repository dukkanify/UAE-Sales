"use client";

import type { FavoriteRecord } from "@/services/storage/client-storage";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/shared/constants/brand";
import { invalidateFavoritesSnapshot } from "@/services/storage/external-store";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function replaceFavorites(favorites: FavoriteRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  invalidateFavoritesSnapshot();
  window.dispatchEvent(new Event(STORAGE_EVENTS.favoritesChange));
}

export async function toggleFavoriteWithApi(
  entry: FavoriteRecord,
): Promise<boolean> {
  const { getFavoritesSnapshot } = await import("@/services/storage/external-store");
  const {
    addServerFavorite,
    removeServerFavorite,
  } = await import("@/services/favorites/favorites-client");

  const previous = getFavoritesSnapshot();
  const wasFavorite = previous.some((item) => item.listingId === entry.listingId);
  const optimistic = wasFavorite
    ? previous.filter((item) => item.listingId !== entry.listingId)
    : [entry, ...previous.filter((item) => item.listingId !== entry.listingId)];

  replaceFavorites(optimistic);

  try {
    const ok = wasFavorite
      ? await removeServerFavorite(entry.listingId)
      : await addServerFavorite(entry);
    if (!ok) {
      replaceFavorites(previous);
      throw new Error("FAVORITE_API_FAILED");
    }
    return !wasFavorite;
  } catch {
    replaceFavorites(previous);
    throw new Error("FAVORITE_API_FAILED");
  }
}

export async function hydrateFavoritesFromServer() {
  const { fetchServerFavorites } = await import("@/services/favorites/favorites-client");
  const server = await fetchServerFavorites();
  if (!server) return;
  replaceFavorites(
    server.map((item) => ({
      listingId: item.listingId,
      slug: item.slug,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      savedAt: item.savedAt,
    })),
  );
}
