import type { CategoryFieldsDefaults, CategoryFieldErrors } from "./CategoryFieldsForm";
import { CategoryFieldsForm } from "./CategoryFieldsForm";
import { SubcategoryField } from "./SubcategoryField";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import type { AddListingErrors } from "./types";

type CategoryFieldsStepProps = {
  categoryId: string;
  errors: AddListingErrors & CategoryFieldErrors;
  subcategories?: string[];
};

export function CategoryFieldsStep({
  categoryId,
  errors,
  subcategories = [],
}: CategoryFieldsStepProps) {
  if (!isDynamicCategory(categoryId)) {
    return null;
  }

  return (
    <CategoryFieldsForm
      categoryId={categoryId}
      errors={errors}
      heading="2. تفاصيل الإعلان"
      stepLabel="الخطوة 2"
      subcategoryField={<SubcategoryField subcategories={subcategories} />}
    />
  );
}

export type { CategoryFieldsDefaults, CategoryFieldErrors };
