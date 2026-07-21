import type { Category } from "@/types";
import {
  getCategoryBySlug as getStoredCategoryBySlug,
  getEnabledCategories,
} from "@/services/categories/category-store";

export async function getCategories(): Promise<Category[]> {
  return getEnabledCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getStoredCategoryBySlug(slug);
}
