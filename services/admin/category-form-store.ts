import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";
import type {
  CategoryFieldDefinition,
  CategoryFieldType,
} from "@/types/domain/category-fields";
import {
  getCategoryFields,
  isDynamicCategory,
} from "@/shared/constants/category-fields";

export type StoredCategoryFormField = {
  id: string;
  categoryId: string;
  fieldKey: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
  enabled: boolean;
  sortOrder: number;
  placeholder?: string;
  note?: string;
  options?: { label: string; value: string }[];
  validation?: string;
  visibility?: string;
  showWhen?: { key: string; values: string[] };
  titlePart?: boolean;
  searchable?: boolean;
  updatedAt: string;
};

const store = createPayloadCollectionStore<StoredCategoryFormField>({
  table: "category_form_fields",
  fileName: "sooqna-category-form-fields.json",
});

function toDefinition(row: StoredCategoryFormField): CategoryFieldDefinition {
  return {
    key: row.fieldKey,
    label: row.label,
    type: row.type,
    required: row.required,
    placeholder: row.placeholder,
    note: row.note,
    options: row.options,
    showWhen: row.showWhen,
    titlePart: row.titlePart,
    searchable: row.searchable,
  };
}

export async function listCategoryFormFields(categoryId: string) {
  const rows = await store.listAll();
  return rows
    .filter((row) => row.categoryId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.fieldKey.localeCompare(b.fieldKey));
}

/** Resolved fields for Add/Edit Listing: DB config when present, else code defaults. */
export async function resolveCategoryFields(
  categoryId: string,
): Promise<CategoryFieldDefinition[]> {
  if (!isDynamicCategory(categoryId)) return [];
  const stored = await listCategoryFormFields(categoryId);
  const enabled = stored.filter((row) => row.enabled);
  if (enabled.length > 0) {
    return enabled.map(toDefinition);
  }
  return getCategoryFields(categoryId);
}

export async function replaceCategoryFormFields(
  categoryId: string,
  fields: Omit<StoredCategoryFormField, "id" | "categoryId" | "updatedAt">[],
): Promise<StoredCategoryFormField[]> {
  const existing = await listCategoryFormFields(categoryId);
  for (const row of existing) {
    await store.removeById(row.id);
  }

  const now = new Date().toISOString();
  const saved: StoredCategoryFormField[] = [];
  for (const [index, field] of fields.entries()) {
    const record: StoredCategoryFormField = {
      id: `cff-${categoryId}-${field.fieldKey}-${Date.now()}-${index}`,
      categoryId,
      fieldKey: field.fieldKey.trim(),
      label: field.label.trim(),
      type: field.type,
      required: Boolean(field.required),
      enabled: field.enabled !== false,
      sortOrder: Number.isFinite(field.sortOrder) ? field.sortOrder : index,
      placeholder: field.placeholder,
      note: field.note,
      options: field.options,
      validation: field.validation,
      visibility: field.visibility,
      showWhen: field.showWhen,
      titlePart: field.titlePart,
      searchable: field.searchable,
      updatedAt: now,
    };
    await store.upsert(record);
    saved.push(record);
  }
  return saved.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function seedCategoryFormFromDefaults(categoryId: string) {
  const defaults = getCategoryFields(categoryId);
  if (defaults.length === 0) return [];
  return replaceCategoryFormFields(
    categoryId,
    defaults.map((field, index) => ({
      fieldKey: field.key,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      enabled: true,
      sortOrder: index,
      placeholder: field.placeholder,
      note: field.note,
      options: field.options,
      showWhen: field.showWhen,
      titlePart: field.titlePart,
      searchable: field.searchable,
    })),
  );
}
