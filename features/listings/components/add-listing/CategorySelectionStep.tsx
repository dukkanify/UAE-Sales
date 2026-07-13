import type { Category } from "@/types";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Select } from "@/shared/ui/Select";
import type { AddListingErrors } from "./types";

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
    <Card className="p-6">
      <h2 className="text-2xl font-black text-ink">1. اختر القسم</h2>
      <p className="mt-2 text-sm font-medium text-muted">
        اختر القسم الأنسب لإعلانك ليظهر أمام المشترين المناسبين.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const isSelected = category.id === selectedCategoryId;

          return (
            <button
              key={category.id}
              aria-pressed={isSelected}
              className={`mobile-home-categories__card rounded-[var(--radius-xl)] border p-4 transition ${
                isSelected
                  ? "border-secondary bg-secondary-soft shadow-[var(--shadow-xs)]"
                  : "border-border bg-surface hover:border-secondary/40"
              }`}
              onClick={() => onSelectCategory(category.id)}
              type="button"
            >
              <CategoryThumbnail category={category} selected={isSelected} />
              <span className="mobile-home-categories__label text-sm font-semibold text-ink">
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
        <div className="mt-5">
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
