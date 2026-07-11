"use client";

import type { FavoriteRecord } from "@/services/storage/client-storage";

export async function fetchServerFavorites(userId: string) {
  const response = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`);
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

export async function addServerFavorite(
  userId: string,
  entry: Omit<FavoriteRecord, "savedAt">,
) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...entry }),
  });
  return response.ok;
}

export async function removeServerFavorite(userId: string, listingId: string) {
  const response = await fetch(
    `/api/favorites/${encodeURIComponent(listingId)}?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  return response.ok;
}

export async function syncFavoritesAfterLogin(userId: string) {
  if (typeof window === "undefined") return;

  const { STORAGE_KEYS, STORAGE_EVENTS } = await import("@/shared/constants/brand");
  const localRaw = window.localStorage.getItem(STORAGE_KEYS.favorites);
  const local = localRaw ? (JSON.parse(localRaw) as FavoriteRecord[]) : [];

  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sync: true,
      userId,
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
  window.dispatchEvent(new Event(STORAGE_EVENTS.favoritesChange));
}
