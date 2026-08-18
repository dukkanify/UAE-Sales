import { getEnabledCategories } from "@/services/categories/category-store";
import { getAllListings } from "@/services/listings/listing-store";
import { getListingPath } from "@/shared/listings/listing-url";
import {
  CATEGORY_SEARCH_KEYWORDS,
  normalizeSearchText,
} from "@/shared/listings/search-text";
import type { Category, Listing } from "@/types";
import type { SearchSuggestion, SearchSuggestionKind } from "@/features/search/types";
import { buildSearchUrl } from "@/features/search/components/search-url";

const INDEX_VERSION = 4;
const MAX_RESULTS = 8;
const MAX_LISTING_RESULTS = 5;
const PRODUCT_CATEGORY_IDS = new Set(["cars", "mobiles", "electronics"]);
const YEAR_RE = /^(19|20)\d{2}$/;
const GENERIC_TOKENS = new Set([
  "جديد",
  "للبيع",
  "مستعمل",
  "ممتاز",
  "حالة",
  "وكالة",
  "موديل",
  "شاشة",
  "بوصة",
  "جيجابايت",
  "sale",
  "new",
  "used",
  "pro",
  "max",
  "the",
  "and",
  "with",
  "for",
]);

type SuggestDoc = {
  categoryId?: string;
  featured: boolean;
  href: string;
  kind: Exclude<SearchSuggestionKind, "recent">;
  keywordNorm?: string;
  label: string;
  labelEn?: string;
  searchNorm: string;
  views: number;
  weight: number;
};

type SuggestIndex = {
  docs: SuggestDoc[];
  key: string;
};

function suggestMemory(): { index: SuggestIndex | null } {
  const globalState = globalThis as typeof globalThis & {
    __sooqnaSuggestIndex?: { index: SuggestIndex | null };
  };
  if (!globalState.__sooqnaSuggestIndex) {
    globalState.__sooqnaSuggestIndex = { index: null };
  }
  return globalState.__sooqnaSuggestIndex;
}

function specText(listing: Listing, key: string): string {
  const value = listing.categorySpecs?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function listingBrand(listing: Listing): string {
  return specText(listing, "brand") || specText(listing, "make");
}

function listingModel(listing: Listing): string {
  return specText(listing, "model");
}

function isLatinQuery(query: string): boolean {
  return /[a-z]/i.test(query) && !/[\u0600-\u06FF]/.test(query);
}

function tokenize(value: string): string[] {
  return value.split(/[^\p{L}\p{N}]+/u).map((part) => part.trim()).filter(Boolean);
}

function isGenericToken(token: string): boolean {
  const normalized = normalizeSearchText(token);
  return (
    !normalized ||
    GENERIC_TOKENS.has(normalized) ||
    YEAR_RE.test(normalized) ||
    normalized.length < 2
  );
}

function compactTokens(value: string, max = 3): string {
  return tokenize(value)
    .filter((token) => !YEAR_RE.test(token))
    .slice(0, max)
    .join(" ");
}

function inferBrand(listing: Listing): { label: string; labelEn: string } {
  const spec = listingBrand(listing);
  const englishTokens = tokenize(listing.titleEnglish ?? "");
  const arabicTokens = tokenize(listing.title);
  const english = englishTokens[0] ?? "";

  if (spec) {
    return { label: spec, labelEn: english };
  }

  if (!PRODUCT_CATEGORY_IDS.has(listing.categoryId)) {
    return { label: "", labelEn: "" };
  }

  let arabic = arabicTokens[0] ?? "";
  if (
    arabic &&
    arabic.length <= 3 &&
    arabicTokens[1] &&
    !/\d/.test(arabicTokens[1]) &&
    !isGenericToken(arabicTokens[1])
  ) {
    arabic = `${arabic} ${arabicTokens[1]}`;
  }

  return { label: arabic, labelEn: english };
}

function inferModelLabel(listing: Listing, brand: string): string {
  const specModel = listingModel(listing);
  if (specModel) {
    return brand ? `${brand} ${specModel}` : specModel;
  }

  const source = `${listing.title} ${listing.titleEnglish ?? ""}`;
  const digitToken = tokenize(source).find(
    (token) => /\d/.test(token) && !YEAR_RE.test(token) && !isGenericToken(token),
  );
  if (brand && digitToken) {
    return `${brand} ${digitToken}`;
  }
  return "";
}

function fieldScore(
  haystackNorm: string,
  queryNorm: string,
  allowContains: boolean,
): number {
  if (!haystackNorm || !queryNorm) return 0;
  if (haystackNorm === queryNorm) return 100;
  if (haystackNorm.startsWith(queryNorm)) {
    return 92 - Math.min(haystackNorm.length - queryNorm.length, 12) * 0.15;
  }

  const tokens = haystackNorm.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (queryNorm.length === 1) {
    return tokens[0]?.startsWith(queryNorm) ? 78 : 0;
  }
  if (tokens.some((token) => token.startsWith(queryNorm))) return 78;
  if (allowContains && haystackNorm.includes(queryNorm)) return 46;
  return 0;
}

function scoreDoc(doc: SuggestDoc, queryNorm: string): number {
  const allowContains = queryNorm.length >= 2;
  const allowBlob = queryNorm.length >= 3;
  const labelNorm = normalizeSearchText(doc.label);
  const labelEnNorm = doc.labelEn ? normalizeSearchText(doc.labelEn) : "";
  const titleScore = Math.max(
    fieldScore(labelNorm, queryNorm, allowContains),
    fieldScore(labelEnNorm, queryNorm, allowContains),
  );
  const blobScore = allowBlob ? fieldScore(doc.searchNorm, queryNorm, true) : 0;
  const keywordScore =
    allowBlob && doc.keywordNorm
      ? fieldScore(doc.keywordNorm, queryNorm, true) * 0.82
      : 0;
  const best = Math.max(titleScore, blobScore * 0.62, keywordScore);
  if (best <= 0) return 0;

  const shortBonus = Math.max(0, 16 - Math.min(doc.label.length, 16)) * 0.4;
  const featuredBonus = doc.featured ? 7 : 0;
  const viewsBonus = Math.min(doc.views, 5000) / 900;
  const cityExactBonus =
    doc.kind === "city" &&
    (labelNorm === queryNorm || labelEnNorm === queryNorm)
      ? 40
      : 0;
  return best * doc.weight + shortBonus + featuredBonus + viewsBonus + cityExactBonus;
}

function pickLabel(doc: SuggestDoc, latin: boolean, queryNorm: string): string {
  if (!doc.labelEn) return doc.label;
  const allowContains = queryNorm.length >= 2;
  const enScore = fieldScore(normalizeSearchText(doc.labelEn), queryNorm, allowContains);
  const arScore = fieldScore(normalizeSearchText(doc.label), queryNorm, allowContains);
  if (latin ? enScore >= arScore : enScore > arScore + 8) {
    return doc.labelEn;
  }
  return doc.label;
}

function isCatalogListing(listing: Listing): boolean {
  return listing.status !== "rejected" && listing.status !== "expired" && listing.status !== "draft";
}

function catalogKey(listings: Listing[], categories: Category[]): string {
  const latest = listings[0];
  return [
    INDEX_VERSION,
    listings.length,
    categories.length,
    latest?.id ?? "",
    latest?.postedAt ?? "",
    latest?.status ?? "",
  ].join(":");
}

function bestListingHref(listings: Listing[]): string | undefined {
  const ranked = [...listings].sort((a, b) => {
    const activeDelta = Number(b.status === "active") - Number(a.status === "active");
    if (activeDelta !== 0) return activeDelta;
    const featuredDelta = Number(b.isFeatured) - Number(a.isFeatured);
    if (featuredDelta !== 0) return featuredDelta;
    return (b.views ?? 0) - (a.views ?? 0);
  });
  return ranked[0] ? getListingPath(ranked[0]) : undefined;
}

function buildDocs(listings: Listing[], categories: Category[]): SuggestDoc[] {
  const visibleListings = listings.filter((listing) => listing.status === "active");
  const catalogListings = listings.filter(isCatalogListing);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const docs: SuggestDoc[] = [];

  for (const category of categories) {
    const keywords = CATEGORY_SEARCH_KEYWORDS[category.id] ?? [];
    docs.push({
      featured: false,
      href: `/categories/${category.slug}`,
      kind: "category",
      keywordNorm: normalizeSearchText(keywords.join(" ")),
      label: category.name,
      searchNorm: normalizeSearchText(
        [category.name, category.slug, ...(category.subcategories ?? [])].join(" "),
      ),
      views: 0,
      weight: 3.4,
    });
  }

  const cities = new Map<string, string>();
  const brands = new Map<
    string,
    { count: number; featured: boolean; label: string; labelEn: string; listings: Listing[] }
  >();
  const models = new Map<
    string,
    { count: number; featured: boolean; label: string; labelEn: string; listings: Listing[] }
  >();

  for (const listing of catalogListings) {
    const brand = inferBrand(listing);
    const model = inferModelLabel(listing, brand.label);
    const city = listing.emirate || listing.city;
    const area = listing.area || listing.city;

    if (city) {
      const key = normalizeSearchText(city);
      if (key) cities.set(key, city);
    }
    if (area && normalizeSearchText(area) !== normalizeSearchText(city)) {
      const key = normalizeSearchText(area);
      if (key) cities.set(key, area);
    }

    if (brand.label) {
      const key = normalizeSearchText(brand.label) || normalizeSearchText(brand.labelEn);
      if (key) {
        const current = brands.get(key) ?? {
          count: 0,
          featured: false,
          label: brand.label,
          labelEn: brand.labelEn,
          listings: [],
        };
        current.count += 1;
        current.featured = current.featured || Boolean(listing.isFeatured);
        if (brand.labelEn) current.labelEn = brand.labelEn;
        current.listings.push(listing);
        brands.set(key, current);
      }
    }

    if (model) {
      const key = normalizeSearchText(model);
      const current = models.get(key) ?? {
        count: 0,
        featured: false,
        label: model,
        labelEn: listing.titleEnglish ? compactTokens(listing.titleEnglish) : "",
        listings: [],
      };
      current.count += 1;
      current.featured = current.featured || Boolean(listing.isFeatured);
      if (listing.titleEnglish) {
        current.labelEn = compactTokens(listing.titleEnglish);
      }
      current.listings.push(listing);
      models.set(key, current);
    }
  }

  for (const listing of visibleListings) {
    const category = categoryById.get(listing.categoryId);
    const brand = inferBrand(listing);
    const model = inferModelLabel(listing, brand.label);
    docs.push({
      categoryId: listing.categoryId,
      featured: Boolean(listing.isFeatured),
      href: getListingPath(listing),
      kind: "listing",
      label: compactTokens(listing.title) || listing.title,
      labelEn: listing.titleEnglish ? compactTokens(listing.titleEnglish) : undefined,
      searchNorm: normalizeSearchText(
        [
          listing.title,
          listing.titleEnglish,
          listing.subcategory,
          listing.city,
          listing.emirate,
          listing.area,
          brand.label,
          brand.labelEn,
          model,
          category?.name,
          ...(listing.features ?? []),
        ]
          .filter(Boolean)
          .join(" "),
      ),
      views: listing.views ?? 0,
      weight: PRODUCT_CATEGORY_IDS.has(listing.categoryId) ? 5.1 : 4.2,
    });
  }

  for (const city of cities.values()) {
    docs.push({
      featured: false,
      href: buildSearchUrl({ city, query: "" }),
      kind: "city",
      label: city,
      searchNorm: normalizeSearchText(city),
      views: 0,
      weight: 2.6,
    });
  }

  for (const brand of brands.values()) {
    docs.push({
      featured: brand.featured,
      href: bestListingHref(brand.listings) ?? buildSearchUrl({ query: brand.label }),
      kind: "brand",
      label: brand.label,
      labelEn: brand.labelEn || undefined,
      searchNorm: normalizeSearchText(`${brand.label} ${brand.labelEn}`),
      views: brand.listings.reduce((sum, listing) => sum + (listing.views ?? 0), 0),
      weight: 4.6 + Math.min(brand.count, 6) * 0.08,
    });
  }

  for (const model of models.values()) {
    docs.push({
      featured: model.featured,
      href: bestListingHref(model.listings) ?? buildSearchUrl({ query: model.label }),
      kind: "model",
      label: model.label,
      labelEn: model.labelEn || undefined,
      searchNorm: normalizeSearchText(`${model.label} ${model.labelEn}`),
      views: model.listings.reduce((sum, listing) => sum + (listing.views ?? 0), 0),
      weight: 4.4,
    });
  }

  return docs;
}

async function getSuggestIndex(): Promise<SuggestDoc[]> {
  const [listings, categories] = await Promise.all([
    getAllListings(),
    getEnabledCategories(),
  ]);
  const key = catalogKey(listings, categories);
  const memory = suggestMemory();
  if (memory.index?.key === key) {
    return memory.index.docs;
  }

  const docs = buildDocs(listings, categories);
  memory.index = { docs, key };
  return docs;
}

function isLessSpecific(label: string, picked: SearchSuggestion[]): boolean {
  const normalized = normalizeSearchText(label);
  return picked.some((item) => {
    const existing = normalizeSearchText(item.label);
    return existing === normalized || existing.startsWith(`${normalized} `);
  });
}

function pickDiverse(
  ranked: Array<SuggestDoc & { score: number }>,
  queryNorm: string,
  latin: boolean,
): SearchSuggestion[] {
  const picked: SearchSuggestion[] = [];
  const seen = new Set<string>();
  let listingCount = 0;
  const shortQuery = queryNorm.length <= 2;
  const slotOrder: Array<SuggestDoc["kind"]> = latin
    ? ["listing", "brand", "model", "category", "city"]
    : ["brand", "model", "category", "listing", "city"];

  const push = (doc: SuggestDoc) => {
    if (shortQuery && doc.kind === "listing" && doc.categoryId === "jobs") {
      return false;
    }
    if (
      queryNorm.length === 1 &&
      doc.kind === "listing" &&
      doc.categoryId &&
      !PRODUCT_CATEGORY_IDS.has(doc.categoryId)
    ) {
      return false;
    }
    const label = pickLabel(doc, latin, queryNorm);
    const dedupe = normalizeSearchText(label);
    if (!dedupe || seen.has(dedupe) || isLessSpecific(label, picked)) return false;
    seen.add(dedupe);
    if (doc.kind === "listing") listingCount += 1;
    picked.push({
      href: doc.href,
      kind: doc.kind,
      label,
    });
    return true;
  };

  if (shortQuery) {
    for (const kind of slotOrder) {
      if (picked.length >= MAX_RESULTS) break;
      for (const doc of ranked) {
        if (doc.kind !== kind) continue;
        if (push(doc)) break;
      }
    }
  }

  for (const doc of ranked) {
    if (picked.length >= MAX_RESULTS) break;
    if (doc.kind === "listing" && listingCount >= MAX_LISTING_RESULTS) continue;
    push(doc);
  }

  return picked;
}

/** Ranked autocomplete rows from the live catalog — not a static demo list. */
export async function getSearchSuggestions(
  query: string,
  options?: { category?: string; city?: string; limit?: number },
): Promise<SearchSuggestion[]> {
  const trimmed = query.trim().slice(0, 80);
  if (!trimmed) return [];

  const queryNorm = normalizeSearchText(trimmed);
  if (!queryNorm) return [];

  const docs = await getSuggestIndex();
  const latin = isLatinQuery(trimmed);
  const cityNorm = options?.city ? normalizeSearchText(options.city) : "";
  const category = options?.category?.trim() ?? "";
  const scoped = docs.filter((doc) => {
    if (category && doc.kind === "listing" && doc.categoryId !== category) {
      return false;
    }
    if (cityNorm && doc.kind === "listing" && !doc.searchNorm.includes(cityNorm)) {
      return false;
    }
    return true;
  });
  const ranked = scoped
    .map((doc) => ({ ...doc, score: scoreDoc(doc, queryNorm) }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score || a.label.length - b.label.length);

  return pickDiverse(ranked, queryNorm, latin).slice(0, options?.limit ?? MAX_RESULTS);
}
