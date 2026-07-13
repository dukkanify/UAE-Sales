import type { Category } from "@/types";
import { getCategoryListingCounts } from "@/mock/catalog-metrics";
import { mockCategories } from "@/mock";

export async function getCategories(): Promise<Category[]> {
  const counts = getCategoryListingCounts();

  return mockCategories.map((category) => ({
    ...category,
    listingCount: counts[category.id] ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return mockCategories.find((category) => category.slug === slug);
}
