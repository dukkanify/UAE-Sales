import { cache } from "react";
import type { Category } from "@/types";
import {
  getCategoryBySlug as getStoredCategoryBySlug,
  getEnabledCategories,
} from "@/services/categories/category-store";

export const getCategories = cache(async (): Promise<Category[]> => {
  return getEnabledCategories();
});

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getStoredCategoryBySlug(slug);
}
