import type { Category } from "@/types";

export function categoryPageHref(slug: string) {
  return `/categories/${slug}`;
}

export function subcategoryPageHref(slug: string, subcategory: string) {
  return `/categories/${slug}?q=${encodeURIComponent(subcategory)}`;
}

export function categoryShortName(name: string) {
  const trimmed = name.trim();
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  return first.replace(/[،,]$/, "") || trimmed;
}

export async function fetchHeaderCategories(
  fallback: Category[],
): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) return fallback;
    const data = (await response.json()) as { categories?: Category[] };
    return data.categories?.length ? data.categories : fallback;
  } catch {
    return fallback;
  }
}
