import type { Category } from "@/types";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Select } from "@/shared/ui/Select";
import type { AddListingErrors } from "./types";
import {
  addListingStepCardClass,
  addListingStepDescClass,
  addListingStepTitleClass,
} from "./utils";

type CategorySelectionStepProps = {
  categories: Category[];
  errors: AddListingErrors;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory?: Category;
  selectedCategoryId: string;
};

export function CategorySelectionStep({
  categories,
  errors,
  onSelectCategory,
  selectedCategory,
  selectedCategoryId,
}: CategorySelectionStepProps) {
  return (
    <Card className={addListingStepCardClass}>
      <h2 className={addListingStepTitleClass}>1. اختر القسم</h2>
      <p className={addListingStepDescClass}>
        اختر القسم الأنسب لإعلانك ليظهر أمام المشترين المناسبين.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-5">
        {categories.map((category) => {
          const isSelected = category.id === selectedCategoryId;

          return (
            <button
              key={category.id}
              aria-pressed={isSelected}
              className={`mobile-home-categories__card gap-1 rounded-[var(--radius-lg)] border p-2 transition sm:gap-1.5 sm:rounded-[var(--radius-xl)] sm:p-2.5 ${
                isSelected
                  ? "border-secondary bg-secondary-soft shadow-[var(--shadow-xs)]"
                  : "border-border bg-surface hover:border-secondary/40"
              }`}
              onClick={() => onSelectCategory(category.id)}
              type="button"
            >
              <CategoryThumbnail
                category={category}
                className="mx-0"
                selected={isSelected}
                variant="compact"
              />
              <span className="mobile-home-categories__label line-clamp-2 text-[10px] font-semibold leading-tight text-ink sm:text-xs">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
      {errors.category ? (
        <FormMessage variant="error">{errors.category}</FormMessage>
      ) : null}

      {(selectedCategory?.subcategories.length ?? 0) > 0 ? (
        <div className="mt-4">
          <Select
            label="القسم الفرعي (اختياري)"
            name="subcategory"
            options={(selectedCategory?.subcategories ?? []).map((subcategory) => ({
              label: subcategory,
              value: subcategory,
            }))}
          />
        </div>
      ) : null}
    </Card>
  );
}
