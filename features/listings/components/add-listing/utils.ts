import type { ListingCondition } from "@/types";

export const ADD_LISTING_STEPS = ["القسم", "التفاصيل", "الصور", "النشر"] as const;

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
