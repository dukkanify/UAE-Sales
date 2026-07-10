import type { Category } from "@/types";
import { mockCategories } from "@/mock";

export async function getCategories(): Promise<Category[]> {
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return mockCategories.find((category) => category.slug === slug);
}
