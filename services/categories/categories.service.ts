import type { Category } from "@/types";
import { mockCategories } from "@/mock";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getAllCategoriesFromDb,
  getCategoryBySlugFromDb,
} from "@/lib/repositories/listings.repository";

export async function getCategories(): Promise<Category[]> {
  return withDataFallback(
    getAllCategoriesFromDb,
    async () => mockCategories,
    "categories",
  );
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  return withDataFallback(
    () => getCategoryBySlugFromDb(slug),
    async () => mockCategories.find((category) => category.slug === slug),
    "category-by-slug",
  );
}
