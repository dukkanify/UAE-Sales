import type { Category, Listing } from "@/types";

/** Reference order: cars, electronics, jobs, furniture, watches */
export const MOBILE_MAIN_CATEGORY_ORDER = [
  "cars",
  "electronics",
  "jobs",
  "furniture",
  "fashion",
] as const;

export const MOBILE_CATEGORY_PAGE_ORDER = [
  ["cars", "electronics", "jobs", "furniture", "fashion"],
  ["mobiles", "real-estate", "services", "pets"],
] as const;

export const MOBILE_MAIN_CATEGORY_LABELS: Record<string, string> = {
  cars: "سيارات",
  electronics: "إلكترونيات",
  jobs: "وظائف",
  furniture: "أثاث",
  fashion: "ساعات",
  mobiles: "موبايلات",
  "real-estate": "عقارات",
  services: "خدمات",
  pets: "حيوانات",
  sports: "رياضة",
};

export const MOBILE_NEARBY_DISTANCES = [
  "1.2 كم",
  "2.4 كم",
  "0.9 كم",
  "3.1 كم",
  "4.8 كم",
  "5.2 كم",
] as const;

export const MOBILE_APP_LINKS = {
  appStore: "https://apps.apple.com/",
  playStore: "https://play.google.com/store",
} as const;

/** @deprecated Kept for legacy section — not used on mobile homepage v3 */
export const MOBILE_TRENDING_SEARCHES = [
  { emoji: "⌚", href: "/search?q=ساعات", label: "ساعات" },
  { emoji: "🏢", href: "/search?q=شقة", label: "شقق" },
  { emoji: "📱", href: "/search?q=iPhone", label: "iPhone" },
  { emoji: "🏡", href: "/search?q=فيلا", label: "فلل" },
  { emoji: "🚗", href: "/search?q=Land+Cruiser", label: "Land Cruiser" },
] as const;

/** @deprecated Kept for legacy section — not used on mobile homepage v3 */
export const MOBILE_TRUST_STATS = [
  { icon: "grid" as const, label: "إعلان نشط", tone: "gold" as const, value: "24K+" },
  { icon: "user" as const, label: "مستخدم موثق", tone: "muted" as const, value: "18K+" },
  { icon: "star" as const, label: "تقييم المنصة", tone: "gold" as const, value: "4.8/5" },
  { icon: "shield" as const, label: "معاملة آمنة", tone: "primary" as const, value: "12K+" },
] as const;

export function getMobileMainCategories(categories: Category[]): Category[] {
  const byId = new Map(categories.map((item) => [item.id, item]));
  return MOBILE_MAIN_CATEGORY_ORDER.map((id) => byId.get(id)).filter(
    (item): item is Category => Boolean(item),
  );
}

export function getMobileCategoryPages(categories: Category[]): Category[][] {
  const byId = new Map(categories.map((item) => [item.id, item]));

  return MOBILE_CATEGORY_PAGE_ORDER.map((page) =>
    page.map((id) => byId.get(id)).filter((item): item is Category => Boolean(item)),
  ).filter((page) => page.length > 0);
}

export type NearbyListing = {
  distance: string;
  listing: Listing;
};

export function getNearbyListings(listings: Listing[], limit = 6): NearbyListing[] {
  return listings.slice(0, limit).map((listing, index) => ({
    listing,
    distance: MOBILE_NEARBY_DISTANCES[index % MOBILE_NEARBY_DISTANCES.length],
  }));
}
