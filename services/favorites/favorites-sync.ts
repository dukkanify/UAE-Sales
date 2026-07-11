"use client";

import type { FavoriteRecord } from "@/services/storage/client-storage";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/shared/constants/brand";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function replaceFavorites(favorites: FavoriteRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  window.dispatchEvent(new Event(STORAGE_EVENTS.favoritesChange));
}

export async function toggleFavoriteWithApi(
  userId: string,
  entry: FavoriteRecord,
): Promise<boolean> {
  const { getFavorites, isFavoriteListing } = await import(
    "@/services/storage/client-storage"
  );
  const {
    addServerFavorite,
    removeServerFavorite,
  } = await import("@/services/favorites/favorites-client");

  const wasFavorite = isFavoriteListing(entry.listingId);
  const previous = getFavorites();
  const optimistic = wasFavorite
    ? previous.filter((item) => item.listingId !== entry.listingId)
    : [entry, ...previous.filter((item) => item.listingId !== entry.listingId)];

  replaceFavorites(optimistic);

  try {
    const ok = wasFavorite
      ? await removeServerFavorite(userId, entry.listingId)
      : await addServerFavorite(userId, entry);
    if (!ok) {
      replaceFavorites(previous);
      return wasFavorite;
    }
    return !wasFavorite;
  } catch {
    replaceFavorites(previous);
    return wasFavorite;
  }
}

export async function hydrateFavoritesFromServer(userId: string) {
  const { fetchServerFavorites } = await import(
    "@/services/favorites/favorites-client"
  );
  const server = await fetchServerFavorites(userId);
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
