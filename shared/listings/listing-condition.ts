import type { ListingCondition } from "@/types";

export const listingConditionLabels: Record<ListingCondition, string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export function formatListingConditionLabel(
  condition?: ListingCondition | null,
): string | null {
  if (!condition) return null;
  return listingConditionLabels[condition] ?? null;
}
