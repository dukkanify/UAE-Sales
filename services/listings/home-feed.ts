import { cache } from "react";
import type { Listing } from "@/types";
import { mockHomeCategorySections } from "@/mock";
import { getAllListings } from "@/services/listings/listing-store";

export type HomeListingCard = Listing;

/** Strip heavy fields so homepage RSC payload stays small. Keep bilingual titles. */
export function slimListingForCard(listing: Listing): Listing {
  const cover = listing.images?.[0];
  return {
    ...listing,
    description: "",
    descriptionEnglish: undefined,
    features: undefined,
    categorySpecs: undefined,
    carSpecs: undefined,
    realEstateSpecs: undefined,
    electronicsSpecs: undefined,
    images: cover ? [cover] : undefined,
  };
}

export type HomeFeed = {
  featured: Listing[];
  nearbySource: Listing[];
  preview: Listing[];
  sections: Array<{
    categoryId: string;
    description: string;
    eyebrow: string;
    items: Listing[];
    title: string;
    variant: "sand" | "white";
  }>;
};

/** Cached homepage slices — cover-only cards, capped sections. */
export const getHomeFeed = cache(async (): Promise<HomeFeed> => {
  const listings = await getAllListings();
  const active = listings.filter((listing) => listing.status === "active");

  const featured = active
    .filter((listing) => listing.isFeatured)
    .slice(0, 6)
    .map(slimListingForCard);

  const sections = mockHomeCategorySections.slice(0, 6).map((section) => ({
    ...section,
    items: active
      .filter((listing) => listing.categoryId === section.categoryId)
      .slice(0, 4)
      .map(slimListingForCard),
  }));

  const nearbySource = active.slice(0, 24).map(slimListingForCard);
  const preview = featured.slice(0, 4);

  return { featured, nearbySource, preview, sections };
});

export const getSearchSuggestionTitles = cache(
  async (): Promise<Array<Pick<Listing, "slug" | "title" | "titleEnglish">>> => {
    const listings = await getAllListings();
    return listings
      .filter((listing) => listing.status === "active")
      .slice(0, 40)
      .map((listing) => ({
        slug: listing.slug,
        title: listing.title,
        titleEnglish: listing.titleEnglish,
      }));
  },
);
