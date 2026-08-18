import type { Listing, ListingCondition } from "@/types";
import { getCategoryFields } from "@/shared/constants/category-fields";

/** Categories where جديد / مستعمل / ممتاز is a real product state. */
const ITEM_CONDITION_CATEGORIES = new Set([
  "cars",
  "mobiles",
  "electronics",
  "furniture",
  "fashion",
  "pets",
  "kids",
  "books",
  "sports",
]);

const CONDITION_LABELS: Record<ListingCondition, string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

const CAR_CONDITION_LABELS: Record<ListingCondition, string> = {
  excellent: "ممتازة",
  new: "جديدة",
  used: "مستعملة",
};

export function categoryUsesItemCondition(categoryId: string): boolean {
  return ITEM_CONDITION_CATEGORIES.has(categoryId);
}

export function formatConditionLabel(
  condition: ListingCondition,
  categoryId?: string,
): string {
  if (categoryId === "cars") return CAR_CONDITION_LABELS[condition];
  return CONDITION_LABELS[condition];
}

export function listingShowsItemCondition(listing: Listing): boolean {
  return categoryUsesItemCondition(listing.categoryId);
}

export function getListingOfferBadge(listing: Listing): string | null {
  const saleType = listing.categorySpecs?.saleType;
  if (typeof saleType === "string" && saleType.trim()) {
    return saleType.trim();
  }
  const purpose = listing.categorySpecs?.purpose;
  if (typeof purpose === "string" && purpose.trim()) {
    return purpose.trim();
  }
  if (listingShowsItemCondition(listing)) {
    return formatConditionLabel(listing.condition, listing.categoryId);
  }
  return null;
}

export function formatStoredConditionValue(
  categoryId: string,
  value: string,
): string {
  const field = getCategoryFields(categoryId).find((item) => item.key === "condition");
  const option = field?.options?.find((item) => item.value === value);
  if (option) return option.label;
  if (value === "new" || value === "used" || value === "excellent") {
    return formatConditionLabel(value, categoryId);
  }
  return value;
}
