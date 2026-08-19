import type { SavedSearch, SavedSearchFilters } from "@/services/saved-searches/identity";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import {
  dedupeSavedSearches,
  hydrateSavedSearch,
  parseSavedSearchUrl,
  savedSearchFingerprint,
  savedSearchIdFromFingerprint,
} from "@/services/saved-searches/identity";

export type ServerSavedSearch = SavedSearch & {
  userId: string;
};

const FILE = "saved-searches.json";
const MAX_SAVED_SEARCHES = 20;

function toClientSearch(item: ServerSavedSearch): SavedSearch {
  return {
    id: item.id,
    label: item.label,
    url: item.url,
    fingerprint: item.fingerprint,
    query: item.query,
    filters: item.filters,
    createdAt: item.createdAt,
    lastUsedAt: item.lastUsedAt,
  };
}

export async function getSavedSearchesForUser(userId: string): Promise<SavedSearch[]> {
  const all = await loadCollection<ServerSavedSearch>(FILE);
  return dedupeSavedSearches(
    all
      .filter((item) => item.userId === userId)
      .map((item) => hydrateSavedSearch(item))
      .filter((item): item is SavedSearch => Boolean(item)),
  );
}

export async function addSavedSearchForUser(
  userId: string,
  input: {
    label: string;
    url: string;
    query?: string;
    filters?: SavedSearchFilters;
  },
): Promise<{ search: SavedSearch; alreadySaved: boolean }> {
  const all = await loadCollection<ServerSavedSearch>(FILE);
  const filters = {
    ...parseSavedSearchUrl(input.url),
    ...(input.filters ?? {}),
    ...(input.query ? { query: input.query } : {}),
  };
  const fingerprint = savedSearchFingerprint(filters);
  const id = savedSearchIdFromFingerprint(fingerprint);
  const existingIndex = all.findIndex(
    (item) => item.userId === userId && (item.fingerprint === fingerprint || item.id === id),
  );

  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    const current = all[existingIndex];
    const updated: ServerSavedSearch = {
      ...current,
      lastUsedAt: now,
      label: current.label,
    };
    all[existingIndex] = updated;
    await saveCollection(FILE, all);
    return { search: toClientSearch(updated), alreadySaved: true };
  }

  const hydrated = hydrateSavedSearch({
    id,
    label: input.label,
    url: input.url,
    query: input.query,
    filters: input.filters,
    fingerprint,
    createdAt: now,
    lastUsedAt: now,
  });
  if (!hydrated) {
    throw new Error("INVALID_SAVED_SEARCH");
  }

  all.unshift({ ...hydrated, userId });
  const userItems = all.filter((item) => item.userId === userId);
  const extra = userItems.slice(MAX_SAVED_SEARCHES);
  const next = extra.length
    ? all.filter((item) => item.userId !== userId || !extra.some((drop) => drop.id === item.id))
    : all;
  await saveCollection(FILE, next);
  return { search: hydrated, alreadySaved: false };
}

export async function removeSavedSearchForUser(userId: string, searchId: string): Promise<boolean> {
  const all = await loadCollection<ServerSavedSearch>(FILE);
  const next = all.filter((item) => !(item.userId === userId && item.id === searchId));
  if (next.length === all.length) return false;
  await saveCollection(FILE, next);
  return true;
}

export async function touchSavedSearchForUser(userId: string, searchId: string): Promise<void> {
  const all = await loadCollection<ServerSavedSearch>(FILE);
  const index = all.findIndex((item) => item.userId === userId && item.id === searchId);
  if (index < 0) return;
  all[index] = { ...all[index], lastUsedAt: new Date().toISOString() };
  await saveCollection(FILE, all);
}

export async function syncSavedSearchesForUser(
  userId: string,
  incoming: Array<{
    label: string;
    url: string;
    query?: string;
    filters?: SavedSearchFilters;
    fingerprint?: string;
    createdAt?: string;
    lastUsedAt?: string;
    id?: string;
  }>,
): Promise<SavedSearch[]> {
  const all = await loadCollection<ServerSavedSearch>(FILE);
  const others = all.filter((item) => item.userId !== userId);
  const existing = all
    .filter((item) => item.userId === userId)
    .map((item) => hydrateSavedSearch(item))
    .filter((item): item is SavedSearch => Boolean(item));

  const local = incoming
    .map((item) => hydrateSavedSearch(item))
    .filter((item): item is SavedSearch => Boolean(item));

  const merged = dedupeSavedSearches([...local, ...existing]).slice(0, MAX_SAVED_SEARCHES);
  const next: ServerSavedSearch[] = [
    ...merged.map((item) => ({ ...item, userId })),
    ...others,
  ];
  await saveCollection(FILE, next);
  return merged;
}
