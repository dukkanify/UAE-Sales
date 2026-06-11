import { mockCategories } from "./mockData";

export async function getCategories() {
  return mockCategories;
}

export async function getCategoryBySlug(slug: string) {
  return mockCategories.find((category) => category.slug === slug);
}

export async function getCategoryById(id: string) {
  return mockCategories.find((category) => category.id === id);
}
