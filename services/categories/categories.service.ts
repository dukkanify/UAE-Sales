import type { Category } from "@/types";
import { mockCategories } from "@/services/data";

export async function getCategories(): Promise<Category[]> {
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return mockCategories.find((category) => category.slug === slug);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return mockCategories.find((category) => category.id === id);
}
