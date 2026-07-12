import type { Category } from "@/types";

export const MOBILE_MAIN_CATEGORY_ORDER = [
  "services",
  "jobs",
  "electronics",
  "real-estate",
  "cars",
] as const;

export const MOBILE_MAIN_CATEGORY_LABELS: Record<string, string> = {
  services: "خدمات",
  jobs: "وظائف",
  electronics: "إلكترونيات",
  "real-estate": "عقارات",
  cars: "سيارات",
};

export const MOBILE_TRENDING_SEARCHES = [
  { href: "/search?q=ساعات", label: "ساعات", icon: "watch" as const },
  { href: "/search?q=شقة", label: "شقق", icon: "home" as const },
  { href: "/search?q=iPhone", label: "iPhone", icon: "phone" as const },
  { href: "/search?q=فيلا", label: "فلل", icon: "home" as const },
  { href: "/search?q=Land+Cruiser", label: "لاند كروزر", icon: "car" as const },
] as const;

export const MOBILE_TRUST_STATS = [
  { icon: "grid" as const, label: "إعلان نشط", value: "24K+" },
  { icon: "shield" as const, label: "مستخدم موثق", value: "18K+" },
  { icon: "star" as const, label: "تقييم المنصة", value: "4.8/5" },
  { icon: "wallet" as const, label: "معاملة آمنة", value: "12K+" },
] as const;

export function getMobileMainCategories(categories: Category[]): Category[] {
  const byId = new Map(categories.map((item) => [item.id, item]));
  return MOBILE_MAIN_CATEGORY_ORDER.map((id) => byId.get(id)).filter(
    (item): item is Category => Boolean(item),
  );
}
