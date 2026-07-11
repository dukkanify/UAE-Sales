import type { ServerFavorite } from "@/types/domain/server-favorite";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "favorites.json";

export async function getFavoritesForUser(userId: string): Promise<ServerFavorite[]> {
  const all = await loadCollection<ServerFavorite>(FILE);
  return all.filter((item) => item.userId === userId);
}

export async function findFavorite(
  userId: string,
  listingId: string,
): Promise<ServerFavorite | undefined> {
  const all = await loadCollection<ServerFavorite>(FILE);
  return all.find(
    (item) => item.userId === userId && item.listingId === listingId,
  );
}

export async function addFavorite(
  input: Omit<ServerFavorite, "id" | "savedAt">,
): Promise<ServerFavorite> {
  const all = await loadCollection<ServerFavorite>(FILE);
  const existing = all.find(
    (item) => item.userId === input.userId && item.listingId === input.listingId,
  );
  if (existing) return existing;

  const favorite: ServerFavorite = {
    ...input,
    id: `fav-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  all.unshift(favorite);
  await saveCollection(FILE, all);
  return favorite;
}

export async function removeFavorite(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const all = await loadCollection<ServerFavorite>(FILE);
  const next = all.filter(
    (item) => !(item.userId === userId && item.listingId === listingId),
  );
  if (next.length === all.length) return false;
  await saveCollection(FILE, next);
  return true;
}

export async function syncFavoritesForUser(
  userId: string,
  incoming: Omit<ServerFavorite, "id" | "userId" | "savedAt">[],
): Promise<ServerFavorite[]> {
  const all = await loadCollection<ServerFavorite>(FILE);
  const existing = all.filter((item) => item.userId === userId);
  const existingIds = new Set(existing.map((item) => item.listingId));

  for (const item of incoming) {
    if (existingIds.has(item.listingId)) continue;
    all.unshift({
      ...item,
      id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      savedAt: new Date().toISOString(),
    });
    existingIds.add(item.listingId);
  }

  await saveCollection(FILE, all);
  return all.filter((item) => item.userId === userId);
}
