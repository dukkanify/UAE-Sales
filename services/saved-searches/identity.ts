export type SavedSearchFilters = {
  category?: string;
  city?: string;
  condition?: string;
  country?: string;
  maxPrice?: string;
  minPrice?: string;
  query?: string;
  sort?: string;
};

export type SavedSearch = {
  id: string;
  label: string;
  url: string;
  fingerprint: string;
  query: string;
  filters: SavedSearchFilters;
  createdAt: string;
  lastUsedAt: string;
};

const FILTER_KEYS = [
  "category",
  "city",
  "condition",
  "country",
  "maxPrice",
  "minPrice",
] as const;

export function normalizeSearchQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeFilterValue(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function parseSavedSearchUrl(url: string): SavedSearchFilters {
  try {
    const parsed = new URL(url, "https://sooqna.local");
    const query = parsed.searchParams.get("q") ?? parsed.searchParams.get("query") ?? "";
    return {
      query: query || undefined,
      country: parsed.searchParams.get("country") || undefined,
      city: parsed.searchParams.get("city") || undefined,
      category: parsed.searchParams.get("category") || undefined,
      condition: parsed.searchParams.get("condition") || undefined,
      minPrice: parsed.searchParams.get("minPrice") || undefined,
      maxPrice: parsed.searchParams.get("maxPrice") || undefined,
      sort: parsed.searchParams.get("sort") || undefined,
    };
  } catch {
    return {};
  }
}

export function savedSearchFingerprint(
  filters: SavedSearchFilters,
  fallbackQuery = "",
): string {
  const query = normalizeSearchQuery(filters.query || fallbackQuery);
  const parts = FILTER_KEYS.map((key) => normalizeFilterValue(filters[key]));
  return [query, ...parts].join("|");
}

export function buildSavedSearchUrl(filters: SavedSearchFilters): string {
  const params = new URLSearchParams();
  const query = (filters.query ?? "").trim().replace(/\s+/g, " ");
  if (query) params.set("q", query);
  if (filters.country) params.set("country", filters.country.trim());
  if (filters.city) params.set("city", filters.city.trim());
  if (filters.category) params.set("category", filters.category.trim());
  if (filters.condition) params.set("condition", filters.condition.trim());
  if (filters.minPrice) params.set("minPrice", filters.minPrice.trim());
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.trim());
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort.trim());
  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}

export function hashSavedSearchFingerprint(fingerprint: string): string {
  let hash = 0;
  for (let index = 0; index < fingerprint.length; index += 1) {
    hash = (Math.imul(31, hash) + fingerprint.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function savedSearchIdFromFingerprint(fingerprint: string): string {
  return `ss-${hashSavedSearchFingerprint(fingerprint)}`;
}

const CONDITION_LABELS: Record<string, string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export function summarizeSavedSearchFilters(filters: SavedSearchFilters): string {
  const parts: string[] = [];
  if (filters.city?.trim()) parts.push(filters.city.trim());
  if (filters.category?.trim()) parts.push(filters.category.trim());
  if (filters.condition?.trim()) {
    parts.push(CONDITION_LABELS[filters.condition] ?? filters.condition.trim());
  }
  const min = filters.minPrice?.trim();
  const max = filters.maxPrice?.trim();
  if (min && max) parts.push(`${min}–${max}`);
  else if (min) parts.push(`${min}+`);
  else if (max) parts.push(`≤ ${max}`);
  return parts.join(" · ");
}

export function formatSavedSearchLastUsed(iso: string | undefined, locale: "ar" | "en" = "ar"): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 24 * 60 * 60 * 1000 && diff >= 0) {
    return locale === "en" ? "Today" : "اليوم";
  }
  return date.toLocaleDateString(locale === "en" ? "en-AE" : "ar-AE", {
    day: "numeric",
    month: "short",
  });
}

function createdAtFromId(id: string): string | undefined {
  const match = id.match(/(\d{10,})/);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return undefined;
  const ms = value > 1e12 ? value : value * 1000;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function timestampOf(item: Pick<SavedSearch, "lastUsedAt" | "createdAt" | "id">): number {
  const lastUsed = Date.parse(item.lastUsedAt);
  if (!Number.isNaN(lastUsed)) return lastUsed;
  const created = Date.parse(item.createdAt);
  if (!Number.isNaN(created)) return created;
  const fromId = item.id.match(/(\d{10,})/);
  return fromId ? Number(fromId[1]) : 0;
}

export function hydrateSavedSearch(raw: unknown): SavedSearch | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Partial<SavedSearch> & { url?: string; label?: string; id?: string };
  if (!record.id || !record.label || !record.url) return null;

  const filters = {
    ...parseSavedSearchUrl(record.url),
    ...(record.filters ?? {}),
  };
  const query = (filters.query || record.query || "").trim().replace(/\s+/g, " ");
  filters.query = query || undefined;
  const fingerprint = record.fingerprint || savedSearchFingerprint(filters);
  const createdAt = record.createdAt || createdAtFromId(record.id) || "1970-01-01T00:00:00.000Z";
  const lastUsedAt = record.lastUsedAt || createdAt;

  return {
    id: savedSearchIdFromFingerprint(fingerprint),
    label: String(record.label).trim() || query || "بحث محفوظ",
    url: buildSavedSearchUrl(filters),
    fingerprint,
    query,
    filters,
    createdAt,
    lastUsedAt,
  };
}

export function dedupeSavedSearches(items: SavedSearch[]): SavedSearch[] {
  const byFingerprint = new Map<string, SavedSearch>();

  for (const item of items) {
    const existing = byFingerprint.get(item.fingerprint);
    if (!existing) {
      byFingerprint.set(item.fingerprint, item);
      continue;
    }
    const keepNewest = timestampOf(item) >= timestampOf(existing);
    const newest = keepNewest ? item : existing;
    const oldest = keepNewest ? existing : item;
    byFingerprint.set(item.fingerprint, {
      ...newest,
      createdAt: oldest.createdAt || newest.createdAt,
      lastUsedAt: newest.lastUsedAt || oldest.lastUsedAt,
    });
  }

  return [...byFingerprint.values()].sort((a, b) => timestampOf(b) - timestampOf(a));
}

export function sameSavedSearch(
  left: SavedSearchFilters,
  right: SavedSearchFilters,
  leftQuery = "",
  rightQuery = "",
): boolean {
  return savedSearchFingerprint(left, leftQuery) === savedSearchFingerprint(right, rightQuery);
}
