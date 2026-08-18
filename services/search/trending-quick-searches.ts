import { cache } from "react";
import type { Listing } from "@/types";
import { getAllFavorites } from "@/services/favorites/favorite-store";
import { getAllListings } from "@/services/listings/listing-store";
import { getSearchTrendCounts } from "@/services/search/search-trend-store";
import {
  CAR_BRANDS,
  ELECTRONICS_BRANDS,
  FASHION_BRANDS,
  MOBILE_BRANDS,
} from "@/shared/constants/product-brands";
import { carModelOptions } from "@/shared/constants/product-models";
import { normalizeSearchText } from "@/shared/listings/search-text";

export type MarketQuickSearch = {
  href: string;
  label: string;
};

type TrendTerm = {
  aliases: string[];
  label: string;
  query: string;
};

const PILL_LIMIT = 10;
const MIN_DYNAMIC_AREA_LISTINGS = 2;

const STOP_LABELS = new Set(["أخرى", "other", "dubai", "دبي", "uae", "الامارات", "الإمارات"]);

const DISPLAY_LABEL: Record<string, string> = {
  "Mercedes-Benz": "Mercedes",
};

const MODEL_ALIASES: Record<string, string[]> = {
  Patrol: ["باترول", "Nissan Patrol"],
  "Land Cruiser": ["لاند كروزر", "لاندكروزر"],
};

const EXTRA_TERMS: TrendTerm[] = [
  { label: "Mercedes", query: "Mercedes", aliases: ["Mercedes-Benz", "Mercedes-AMG", "مرسيدس"] },
  { label: "iPhone", query: "iPhone", aliases: ["ايفون", "آيفون"] },
  { label: "MacBook", query: "MacBook", aliases: ["ماك بوك"] },
  { label: "Apartment", query: "شقة", aliases: ["شقق", "Apartment"] },
  { label: "Villa", query: "فيلا", aliases: ["فلل", "Villa"] },
  { label: "Office", query: "مكتب", aliases: ["مكاتب", "Office"] },
  { label: "Palm Jumeirah", query: "نخلة جميرا", aliases: ["Palm Jumeirah", "النخلة"] },
  { label: "Downtown Dubai", query: "داون تاون", aliases: ["Downtown Dubai", "داونتاون"] },
];

const FALLBACK_SEARCHES: MarketQuickSearch[] = [
  { href: "/search?q=Mercedes", label: "Mercedes" },
  { href: "/search?q=Patrol", label: "Patrol" },
  { href: "/search?q=نخلة+جميرا", label: "Palm Jumeirah" },
  { href: "/search?q=داون+تاون", label: "Downtown Dubai" },
  { href: "/search?q=شقة", label: "Apartment" },
  { href: "/search?q=فيلا", label: "Villa" },
  { href: "/search?q=iPhone", label: "iPhone" },
  { href: "/search?q=مكتب", label: "Office" },
  { href: "/search?q=MacBook", label: "MacBook" },
  { href: "/search?q=Land+Cruiser", label: "Land Cruiser" },
];

function asTerm(label: string, extraAliases: string[] = []): TrendTerm | null {
  const trimmed = label.trim();
  if (!trimmed || STOP_LABELS.has(trimmed.toLowerCase()) || STOP_LABELS.has(trimmed)) {
    return null;
  }
  const display = DISPLAY_LABEL[trimmed] ?? trimmed;
  return {
    label: display,
    query: display,
    aliases: extraAliases.includes(trimmed) ? extraAliases : [trimmed, ...extraAliases],
  };
}

function catalogTerms(): TrendTerm[] {
  const terms: TrendTerm[] = [];
  const seen = new Set<string>();

  function add(term: TrendTerm | null) {
    if (!term) return;
    const key = normalizeSearchText(term.query);
    if (!key || seen.has(key)) return;
    seen.add(key);
    terms.push(term);
  }

  for (const extra of EXTRA_TERMS) add(extra);

  for (const brand of [...CAR_BRANDS, ...MOBILE_BRANDS, ...ELECTRONICS_BRANDS, ...FASHION_BRANDS]) {
    add(asTerm(brand));
  }

  for (const option of carModelOptions) {
    add(asTerm(option.label, MODEL_ALIASES[option.label] ?? []));
  }

  return terms.sort((a, b) => b.query.length - a.query.length);
}

function listingHaystack(listing: Listing): string {
  const specValues = listing.categorySpecs
    ? Object.values(listing.categorySpecs).flatMap((value) =>
        typeof value === "string" || typeof value === "number" ? [String(value)] : [],
      )
    : [];
  const parts = [
    listing.title,
    listing.titleEnglish,
    listing.subcategory,
    listing.area,
    listing.city,
    listing.emirate,
    listing.realEstateSpecs?.community,
    listing.realEstateSpecs?.developer,
    ...specValues,
  ];
  return normalizeSearchText(parts.filter(Boolean).join(" "))
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termNeedles(term: TrendTerm): string[] {
  return [term.query, term.label, ...term.aliases]
    .map((item) => normalizeSearchText(item))
    .filter((item) => item.length >= 2);
}

function haystackHitsTerm(haystack: string, term: TrendTerm): boolean {
  const tokens = new Set(haystack.split(" ").filter(Boolean));
  return termNeedles(term).some((needle) => {
    if (needle.includes(" ")) return haystack.includes(needle);
    if (needle.length <= 3) return tokens.has(needle);
    return haystack.includes(needle);
  });
}

function queryHitsTerm(searchQuery: string, term: TrendTerm): boolean {
  const q = normalizeSearchText(searchQuery);
  if (q.length < 2) return false;
  return termNeedles(term).some(
    (needle) => needle === q || q.includes(needle) || (needle.length >= 4 && needle.includes(q)),
  );
}

function areaTermsFromListings(listings: Listing[], existing: TrendTerm[]): TrendTerm[] {
  const covered = new Set(existing.flatMap(termNeedles));
  const counts = new Map<string, { count: number; label: string }>();

  for (const listing of listings) {
    for (const raw of [listing.area, listing.realEstateSpecs?.community]) {
      const label = raw?.trim();
      if (!label || label.length < 3) continue;
      if (STOP_LABELS.has(label) || STOP_LABELS.has(label.toLowerCase())) continue;
      const key = normalizeSearchText(label);
      if (key.length < 3 || covered.has(key)) continue;
      const current = counts.get(key);
      if (current) current.count += 1;
      else counts.set(key, { count: 1, label });
    }
  }

  return Array.from(counts.values())
    .filter((item) => item.count >= MIN_DYNAMIC_AREA_LISTINGS)
    .map((item) => asTerm(item.label))
    .filter((item): item is TrendTerm => Boolean(item));
}

function listingEngagementScore(listing: Listing, favoriteCount: number): number {
  let score = 10;
  score += Math.min(listing.views, 20000) / 80;
  if (listing.isFeatured) score += 16;
  if (listing.isPremium) score += 8;
  if (listing.isUrgent) score += 6;
  score += favoriteCount * 22;
  return score;
}

export const getTrendingQuickSearches = cache(async (): Promise<MarketQuickSearch[]> => {
  const [listings, favorites, searches] = await Promise.all([
    getAllListings(),
    getAllFavorites(),
    getSearchTrendCounts(),
  ]);

  const active = listings.filter((listing) => listing.status === "active");
  const favoriteCounts = new Map<string, number>();
  for (const favorite of favorites) {
    favoriteCounts.set(favorite.listingId, (favoriteCounts.get(favorite.listingId) ?? 0) + 1);
  }

  const catalog = catalogTerms();
  const terms = [...catalog, ...areaTermsFromListings(active, catalog)];
  const scores = new Map<string, { aliases: string[]; label: string; query: string; score: number }>();

  function bump(term: TrendTerm, amount: number) {
    const key = normalizeSearchText(term.query);
    const current = scores.get(key);
    if (current) {
      current.score += amount;
      return;
    }
    scores.set(key, {
      aliases: term.aliases,
      label: term.label,
      query: term.query,
      score: amount,
    });
  }

  for (const listing of active) {
    const haystack = listingHaystack(listing);
    const engagement = listingEngagementScore(
      listing,
      favoriteCounts.get(listing.id) ?? 0,
    );
    for (const term of terms) {
      if (haystackHitsTerm(haystack, term)) bump(term, engagement);
    }
  }

  for (const row of searches) {
    for (const term of terms) {
      if (queryHitsTerm(row.query, term)) bump(term, row.count * 28);
    }
  }

  const ranked = Array.from(scores.values())
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "ar"));

  const picked: MarketQuickSearch[] = [];
  const used = new Set<string>();

  for (const item of ranked) {
    const needles = termNeedles({
      aliases: item.aliases,
      label: item.label,
      query: item.query,
    });
    if (needles.some((needle) => used.has(needle))) continue;
    for (const needle of needles) used.add(needle);
    picked.push({
      href: `/search?q=${encodeURIComponent(item.query)}`,
      label: item.label,
    });
    if (picked.length >= PILL_LIMIT) break;
  }

  if (picked.length >= 6) return picked;

  for (const fallback of FALLBACK_SEARCHES) {
    const key = normalizeSearchText(fallback.label);
    if (used.has(key)) continue;
    picked.push(fallback);
    used.add(key);
    if (picked.length >= PILL_LIMIT) break;
  }

  return picked;
});
