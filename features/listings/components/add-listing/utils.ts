import type { ListingCondition } from "@/types";

export const ADD_LISTING_STEPS = ["القسم", "التفاصيل", "الصور", "النشر"] as const;

export const addListingStepCardClass = "p-4 sm:p-5";
export const addListingStepTitleClass = "text-xl font-black text-ink sm:text-2xl";
export const addListingStepDescClass = "mt-1 text-xs font-medium text-muted sm:text-sm";
export const addListingStepBodyClass = "mt-3 grid gap-3 sm:mt-4";
export const addListingDynamicFieldsGridClass =
  "mt-3 grid grid-cols-2 gap-x-2.5 gap-y-2.5 sm:mt-4 sm:gap-3";
export const addListingStepFooterClass = "col-span-2 mt-3 grid gap-3 sm:mt-4";

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
