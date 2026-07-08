import type { CategoryFieldDefinition, CategorySpecs, ListingCondition } from "@/types";
import {
  getCategoryFields,
  isDynamicCategory,
} from "@/shared/constants/category-fields";

export type CategoryFormResult = {
  categorySpecs: CategorySpecs;
  errors: Record<string, string>;
  features: string[];
  negotiable?: boolean;
  title: string;
  condition: ListingCondition;
  city: string;
  emirate?: string;
};

function readFieldValue(
  formData: FormData,
  field: CategoryFieldDefinition,
): string | string[] {
  if (field.type === "checkbox-group") {
    return formData.getAll(`spec_${field.key}`).map(String);
  }
  return String(formData.get(`spec_${field.key}`) ?? "").trim();
}

function hasFieldValue(value: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value.length > 0;
}

export function parseCategoryForm(
  formData: FormData,
  categoryId: string,
): CategoryFormResult {
  const errors: Record<string, string> = {};
  const categorySpecs: CategorySpecs = {};
  let features: string[] = [];
  let condition: ListingCondition = "used";
  let city = "";
  let emirate: string | undefined;

  if (!isDynamicCategory(categoryId)) {
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price") ?? 0);
    const cityId = String(formData.get("city") ?? "dubai");

    if (title.length < 8) errors.title = "عنوان الإعلان يجب أن يكون 8 أحرف على الأقل.";
    if (description.length < 20) errors.description = "اكتب وصفاً لا يقل عن 20 حرفاً.";
    if (!Number.isFinite(price) || price <= 0) errors.price = "اكتب سعراً صحيحاً.";

    return {
      categorySpecs: {},
      errors,
      features: [],
      title,
      condition: String(formData.get("condition") ?? "used") as ListingCondition,
      city: cityId,
      emirate: undefined,
    };
  }

  const fields = getCategoryFields(categoryId);

  for (const field of fields) {
    const raw = readFieldValue(formData, field);

    if (field.type === "checkbox-group") {
      const values = raw as string[];
      if (field.key === "features" && values.length > 0) {
        features = values;
      }
      continue;
    }

    const value = raw as string;
    if (!hasFieldValue(value)) {
      if (field.required) {
        errors[field.key] = `${field.label} مطلوب.`;
      }
      continue;
    }

    if (field.key === "condition") {
      condition = value as ListingCondition;
    } else if (field.key === "city") {
      city = value;
    } else if (field.key === "emirate") {
      emirate = value;
    } else if (field.type === "number") {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.key] = `${field.label} يجب أن يكون رقماً.`;
      } else {
        categorySpecs[field.key] = numeric;
      }
    } else {
      categorySpecs[field.key] = value;
    }
  }

  const description = String(formData.get("description") ?? "").trim();
  if (description.length < 20) {
    errors.description = "اكتب وصفاً لا يقل عن 20 حرفاً.";
  }

  const price = Number(formData.get("price") ?? 0);
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "اكتب سعراً صحيحاً أكبر من صفر.";
  }

  const titleParts = fields
    .filter((field) => field.titlePart)
    .map((field) => categorySpecs[field.key])
    .filter((value) => hasFieldValue(String(value ?? "")));

  const title = titleParts.join(" ").trim();
  if (title.length < 8) {
    errors.title = "أكمل الحقول الأساسية لتوليد عنوان الإعلان.";
  }

  const negotiableSelected = features.includes("قابل للتفاوض");
  if (negotiableSelected) {
    features = features.filter((item) => item !== "قابل للتفاوض");
  }

  return {
    categorySpecs,
    errors,
    features,
    negotiable: negotiableSelected || undefined,
    title,
    condition,
    city,
    emirate,
  };
}
