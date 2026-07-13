import type { ListingCondition } from "@/types";

export const ADD_LISTING_STEPS = ["القسم", "التفاصيل", "الصور", "النشر"] as const;

export const addListingStepCardClass = "p-4 sm:p-5";
export const addListingStepTitleClass = "text-xl font-black text-ink sm:text-2xl";
export const addListingStepDescClass = "mt-1 text-sm font-medium text-muted";
export const addListingStepBodyClass = "mt-4 grid gap-4 sm:mt-5";

export const conditionLabels: Record<ListingCondition, string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
