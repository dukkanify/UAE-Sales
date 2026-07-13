import type { ListingCondition } from "@/types";

export const ADD_LISTING_STEPS = ["القسم", "التفاصيل", "الصور", "النشر"] as const;

export const addListingStepCardClass = "p-4 sm:p-5";
export const addListingStepTitleClass = "text-xl font-black text-ink sm:text-2xl";
export const addListingStepDescClass = "mt-1 text-xs font-medium text-muted sm:text-sm";
export const addListingStepBodyClass = "mt-3 grid gap-3 sm:mt-4";
export const addListingDynamicFieldsGridClass =
  "mt-3 grid grid-cols-2 gap-x-2.5 gap-y-2.5 sm:mt-4 sm:gap-3";
export const addListingStepFooterClass = "col-span-2 mt-3 grid gap-3 sm:mt-4";
export const addListingCheckboxGroupClass =
  "grid gap-1 rounded-[var(--radius-lg)] border border-border p-2.5 sm:rounded-[var(--radius-xl)] sm:p-3";
export const addListingCheckboxGridClass =
  "grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-1.5";
export const addListingCheckboxLabelClass =
  "flex min-w-0 items-center gap-1.5 text-[0.7rem] font-medium leading-tight text-muted sm:text-xs";

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
