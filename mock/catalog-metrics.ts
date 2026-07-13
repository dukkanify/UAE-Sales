import type { HomeCityHighlight } from "@/types";
import { cities } from "@/shared/constants/locations";
import { marketplaceListings } from "./listings.mock";

const EMIRATE_NAME_TO_CITY_ID: Record<string, string> = {
  دبي: "dubai",
  "أبوظبي": "abu-dhabi",
  الشارقة: "sharjah",
  عجمان: "ajman",
  "أم القيوين": "umm-al-quwain",
  "رأس الخيمة": "rak",
  الفجيرة: "fujairah",
};

export function getActiveMarketplaceListings() {
  return marketplaceListings.filter((listing) => listing.status === "active");
}

export function getCategoryListingCounts(): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const listing of getActiveMarketplaceListings()) {
    counts[listing.categoryId] = (counts[listing.categoryId] ?? 0) + 1;
  }

  return counts;
}

export function getEmirateListingHighlights(): HomeCityHighlight[] {
  const counts = new Map<string, number>();

  for (const listing of getActiveMarketplaceListings()) {
    const emirateName = listing.emirate ?? listing.city;
    const cityId = EMIRATE_NAME_TO_CITY_ID[emirateName];
    if (!cityId) continue;
    counts.set(cityId, (counts.get(cityId) ?? 0) + 1);
  }

  return cities.map((city) => {
    const countKey = city.id === "ras-al-khaimah" ? "rak" : city.id;
    return {
      cityId: countKey,
      listingCount: counts.get(countKey) ?? 0,
    };
  });
}

export function getActiveListingCount(): number {
  return getActiveMarketplaceListings().length;
}
