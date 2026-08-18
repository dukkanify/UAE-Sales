import { loadCollection, saveCollection } from "@/services/payments/data-store";
import { normalizeSearchText } from "@/shared/listings/search-text";

const FILE = "search-trends.json";
const MIN_QUERY_LENGTH = 2;
const MAX_ROWS = 400;

type SearchTrendRow = {
  count: number;
  lastSearchedAt: string;
  query: string;
};

function isRecordableQuery(query: string) {
  const normalized = normalizeSearchText(query);
  if (normalized.length < MIN_QUERY_LENGTH) return false;
  if (/^\d+$/.test(normalized)) return false;
  return true;
}

export async function recordSearchQuery(rawQuery: string): Promise<void> {
  try {
    const query = rawQuery.trim();
    if (!isRecordableQuery(query)) return;

    const key = normalizeSearchText(query);
    const rows = await loadCollection<SearchTrendRow>(FILE);
    const existing = rows.find((row) => normalizeSearchText(row.query) === key);
    const now = new Date().toISOString();

    if (existing) {
      existing.count += 1;
      existing.lastSearchedAt = now;
    } else {
      rows.unshift({ count: 1, lastSearchedAt: now, query });
    }

    rows.sort((a, b) => b.count - a.count || b.lastSearchedAt.localeCompare(a.lastSearchedAt));
    await saveCollection(FILE, rows.slice(0, MAX_ROWS));
  } catch {
    // Search volume is best-effort and must not break listing pages.
  }
}

export async function getSearchTrendCounts(): Promise<SearchTrendRow[]> {
  return loadCollection<SearchTrendRow>(FILE);
}
