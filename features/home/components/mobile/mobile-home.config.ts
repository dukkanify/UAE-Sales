import type { Category } from "@/types";

/** Short Arabic labels for the mobile category grid (reference layout). */
export const MOBILE_CATEGORY_SHORT_LABELS: Record<string, string> = {
  cars: "السيارات",
  "real-estate": "عقارات",
  jobs: "وظائف",
  mobiles: "موبايلات",
  electronics: "إلكترونيات",
  furniture: "المنزل",
  fashion: "الموضة",
  pets: "حيوانات",
  sports: "رياضة",
  books: "كتب",
  kids: "أطفال",
  food: "طعام",
};

/** Display order matching the mobile reference (4×3 grid). */
export const MOBILE_HOME_CATEGORY_ORDER = [
  "cars",
  "real-estate",
  "jobs",
  "mobiles",
  "electronics",
  "furniture",
  "fashion",
  "pets",
  "sports",
  "books",
  "kids",
  "food",
] as const;

export function getMobileHomeCategories(categories: Category[]): Category[] {
  const byId = new Map(categories.map((item) => [item.id, item]));
  return MOBILE_HOME_CATEGORY_ORDER.map((id) => byId.get(id)).filter(
    (item): item is Category => Boolean(item),
  );
}
