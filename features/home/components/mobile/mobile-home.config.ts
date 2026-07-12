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
  { emoji: "⌚", href: "/search?q=ساعات", label: "ساعات" },
  { emoji: "🏢", href: "/search?q=شقة", label: "شقق" },
  { emoji: "📱", href: "/search?q=iPhone", label: "iPhone" },
  { emoji: "🏡", href: "/search?q=فيلا", label: "فلل" },
  { emoji: "🚗", href: "/search?q=Land+Cruiser", label: "Land Cruiser" },
] as const;

export const MOBILE_TRUST_STATS = [
  { icon: "grid" as const, label: "إعلان نشط", tone: "gold" as const, value: "24K+" },
  { icon: "user" as const, label: "مستخدم موثق", tone: "muted" as const, value: "18K+" },
  { icon: "star" as const, label: "تقييم المنصة", tone: "gold" as const, value: "4.8/5" },
  { icon: "shield" as const, label: "معاملة آمنة", tone: "primary" as const, value: "12K+" },
] as const;

export function getMobileMainCategories(categories: Category[]): Category[] {
  const byId = new Map(categories.map((item) => [item.id, item]));
  return MOBILE_MAIN_CATEGORY_ORDER.map((id) => byId.get(id)).filter(
    (item): item is Category => Boolean(item),
  );
}
