import type { SearchSuggestion } from "@/features/search/types";

const SUGGEST_TTL_MS = 10_000;
const MAX_ENTRIES = 40;

type CacheEntry = {
  at: number;
  items: SearchSuggestion[];
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<SearchSuggestion[]>>();

export function suggestCacheKey(query: string, category?: string, city?: string) {
  return `${query.trim().toLowerCase()}|${category ?? ""}|${city ?? ""}`;
}

export function getCachedSuggestions(key: string): SearchSuggestion[] | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > SUGGEST_TTL_MS) {
    memory.delete(key);
    return null;
  }
  return hit.items;
}

function setCachedSuggestions(key: string, items: SearchSuggestion[]) {
  memory.set(key, { at: Date.now(), items });
  if (memory.size <= MAX_ENTRIES) return;
  const oldest = memory.keys().next().value;
  if (oldest) memory.delete(oldest);
}

export function invalidateSuggestCache() {
  memory.clear();
  inflight.clear();
}

export async function fetchSearchSuggestions(
  key: string,
  url: string,
): Promise<SearchSuggestion[]> {
  const cached = getCachedSuggestions(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = fetch(url, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      const items = Array.isArray(data?.items)
        ? (data.items as SearchSuggestion[])
        : [];
      setCachedSuggestions(key, items);
      return items;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}
