import { mockCategories } from "@/mock/categories.mock";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type { Category } from "@/types";
import type {
  AdminCategoryCreateInput,
  AdminCategoryPatch,
  AdminCategoryRecord,
} from "@/types/domain/admin";
import { getAllListings } from "@/services/listings/listing-store";

const FILE = "categories.json";

type StoredCategory = Category & { enabled: boolean };

let cache: StoredCategory[] | null = null;

function seedCategories(): StoredCategory[] {
  return mockCategories.map((category) => ({
    ...category,
    enabled: true,
  }));
}

function setCache(rows: StoredCategory[]) {
  cache = rows.map((row) => ({ ...row, subcategories: [...row.subcategories] }));
  return cache;
}

export async function getAllCategoryRecords(): Promise<StoredCategory[]> {
  if (cache) {
    return cache.map((row) => ({
      ...row,
      subcategories: [...row.subcategories],
    }));
  }

  const stored = await loadCollection<StoredCategory>(FILE).catch(
    () => [] as StoredCategory[],
  );
  if (stored.length === 0) {
    const seeded = seedCategories();
    await saveCollection(FILE, seeded);
    return setCache(seeded).map((row) => ({
      ...row,
      subcategories: [...row.subcategories],
    }));
  }

  return setCache(stored).map((row) => ({
    ...row,
    subcategories: [...row.subcategories],
  }));
}

export async function getEnabledCategories(): Promise<Category[]> {
  const [categories, listings] = await Promise.all([
    getAllCategoryRecords(),
    getAllListings(),
  ]);

  const counts = new Map<string, number>();
  for (const listing of listings) {
    if (listing.status !== "active") continue;
    counts.set(listing.categoryId, (counts.get(listing.categoryId) ?? 0) + 1);
  }

  return categories
    .filter((category) => category.enabled)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      listingCount: counts.get(category.id) ?? category.listingCount ?? 0,
      subcategories: [...category.subcategories],
    }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const categories = await getEnabledCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getAdminCategoryRecords(): Promise<AdminCategoryRecord[]> {
  const [categories, listings] = await Promise.all([
    getAllCategoryRecords(),
    getAllListings(),
  ]);
  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(listing.categoryId, (counts.get(listing.categoryId) ?? 0) + 1);
  }

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    listingCount: counts.get(category.id) ?? 0,
    enabled: category.enabled,
    subcategories: [...category.subcategories],
  }));
}

export async function createCategoryRecord(
  input: AdminCategoryCreateInput,
): Promise<AdminCategoryRecord> {
  const categories = await getAllCategoryRecords();
  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const record: StoredCategory = {
    id: `cat-${Date.now()}`,
    name: input.name.trim(),
    slug,
    icon: input.icon ?? "wrench",
    listingCount: 0,
    subcategories: [],
    enabled: true,
  };
  categories.unshift(record);
  await saveCollection(FILE, categories);
  setCache(categories);
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    icon: record.icon,
    listingCount: 0,
    enabled: true,
    subcategories: [],
  };
}

export async function patchCategoryRecord(
  id: string,
  patch: AdminCategoryPatch,
): Promise<AdminCategoryRecord | undefined> {
  const categories = await getAllCategoryRecords();
  const index = categories.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  categories[index] = {
    ...categories[index],
    ...patch,
    subcategories: [...categories[index].subcategories],
  };
  await saveCollection(FILE, categories);
  setCache(categories);
  const row = categories[index];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    listingCount: row.listingCount,
    enabled: row.enabled,
    subcategories: [...row.subcategories],
  };
}
