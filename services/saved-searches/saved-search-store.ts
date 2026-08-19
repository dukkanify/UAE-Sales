import type { Listing } from "@/types";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type SavedSearchRecord = {
  categoryId?: string;
  city?: string;
  createdAt: string;
  id: string;
  label: string;
  query?: string;
  url: string;
  userId: string;
};

const FILE = "saved-searches.json";

function parseSearchParams(url: string): URLSearchParams {
  try {
    const parsed = new URL(url, "https://sooqna.site");
    return parsed.searchParams;
  } catch {
    const query = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
    return new URLSearchParams(query);
  }
}

export async function upsertSavedSearch(
  input: Omit<SavedSearchRecord, "createdAt">,
): Promise<SavedSearchRecord> {
  const all = await loadCollection<SavedSearchRecord>(FILE);
  const existingIndex = all.findIndex(
    (item) => item.userId === input.userId && (item.id === input.id || item.url === input.url),
  );
  const record: SavedSearchRecord = {
    ...input,
    createdAt: all[existingIndex]?.createdAt ?? new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...record };
  } else {
    all.unshift(record);
  }
  await saveCollection(FILE, all.slice(0, 400));
  return record;
}

export async function removeSavedSearchForUser(
  userId: string,
  id: string,
): Promise<void> {
  const all = await loadCollection<SavedSearchRecord>(FILE);
  await saveCollection(
    FILE,
    all.filter((item) => !(item.userId === userId && item.id === id)),
  );
}

export async function getSavedSearchesForUser(
  userId: string,
): Promise<SavedSearchRecord[]> {
  const all = await loadCollection<SavedSearchRecord>(FILE);
  return all.filter((item) => item.userId === userId);
}

export async function matchSavedSearchesForListing(
  listing: Listing,
): Promise<SavedSearchRecord[]> {
  const all = await loadCollection<SavedSearchRecord>(FILE);
  const title = listing.title.toLowerCase();
  const city = (listing.city ?? "").toLowerCase();
  const categoryId = listing.categoryId;

  return all.filter((item) => {
    const params = parseSearchParams(item.url);
    const query = (item.query ?? params.get("q") ?? params.get("query") ?? "")
      .trim()
      .toLowerCase();
    const searchCity = (item.city ?? params.get("city") ?? "").trim().toLowerCase();
    const searchCategory =
      item.categoryId ?? params.get("category") ?? params.get("categoryId") ?? "";

    if (searchCategory && searchCategory !== categoryId) return false;
    if (searchCity && searchCity !== city) return false;
    if (query && !title.includes(query) && !query.split(/\s+/).some((part) => title.includes(part))) {
      return false;
    }
    return Boolean(query || searchCity || searchCategory);
  });
}
