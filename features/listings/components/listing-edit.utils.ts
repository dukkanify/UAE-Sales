import type { Listing } from "@/types";
import type { CategoryFieldsDefaults } from "./add-listing/CategoryFieldsForm";

export function buildCategoryFieldsDefaults(listing: Listing): CategoryFieldsDefaults {
  return {
    categorySpecs: listing.categorySpecs,
    condition: listing.condition,
    contactPhone: listing.contactPhone,
    description: listing.description,
    features: listing.features,
    negotiable: listing.negotiable,
    price: listing.price,
  };
}

export { getListingImages } from "./listing-card.utils";
