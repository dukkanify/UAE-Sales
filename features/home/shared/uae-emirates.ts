import { cities } from "@/shared/constants/locations";
import {
  emirateLandmarkLabels,
  type EmirateImageKey,
} from "@/shared/constants/image-fallbacks";
import { getHomeCityHighlights } from "@/services/content";
import { getMarketEmirateImages } from "@/services/content/homepage-marketplace.content";

/** Maps city id to listing-count key in mock highlights (e.g. RAK). */
export const EMIRATE_COUNT_ALIASES: Record<string, string> = {
  "ras-al-khaimah": "rak",
};

export type UaeEmirateCard = {
  count: number;
  href: string;
  id: string;
  imageUrl: string;
  landmark: string;
  name: string;
};

export async function getUaeEmiratesCards(): Promise<UaeEmirateCard[]> {
  const [images, highlights] = await Promise.all([
    getMarketEmirateImages(),
    getHomeCityHighlights(),
  ]);
  const countMap = new Map(highlights.map((item) => [item.cityId, item.listingCount]));

  return cities.map((city) => {
    const countKey = EMIRATE_COUNT_ALIASES[city.id] ?? city.id;

    return {
      id: city.id,
      name: city.name,
      href: `/search?city=${encodeURIComponent(city.name)}`,
      imageUrl: images[city.id],
      landmark: emirateLandmarkLabels[city.id as EmirateImageKey] ?? city.name,
      count: countMap.get(countKey) ?? 500,
    };
  });
}
