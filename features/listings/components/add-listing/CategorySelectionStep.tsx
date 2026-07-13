import type { Category } from "@/types";
import { Card } from "@/shared/ui/Card";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { FormMessage } from "@/shared/ui/FormMessage";
import type { AddListingErrors } from "./types";

type CategorySelectionStepProps = {
  categories: Category[];
  errors: AddListingErrors;
  isExpanded: boolean;
  onExpand: () => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory?: Category;
  selectedCategoryId: string;
};

export function CategorySelectionStep({
  categories,
  errors,
  isExpanded,
  onExpand,
  onSelectCategory,
  selectedCategory,
  selectedCategoryId,
}: CategorySelectionStepProps) {
  const showCompactSummary = Boolean(selectedCategory) && !isExpanded;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-black text-ink">1. اختر القسم</h2>
      <p className="mt-2 text-sm font-medium text-muted">
        اختر القسم الأنسب لإعلانك ليظهر أمام المشترين المناسبين.
      </p>

      {showCompactSummary && selectedCategory ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-secondary/30 bg-secondary-soft p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-surface text-secondary shadow-[var(--shadow-xs)]"
              aria-hidden
            >
              <CategoryIcon category={selectedCategory} size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted">القسم المختار</p>
              <p className="truncate text-sm font-bold text-ink">{selectedCategory.name}</p>
            </div>
          </div>
          <button
            className="shrink-0 rounded-[var(--radius-lg)] border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-secondary/40"
            onClick={onExpand}
            type="button"
          >
            تغيير القسم
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const isSelected = category.id === selectedCategoryId;

            return (
              <button
                key={category.id}
                aria-pressed={isSelected}
                className={`rounded-[var(--radius-xl)] border p-4 text-center transition ${
                  isSelected
                    ? "border-secondary bg-secondary-soft shadow-[var(--shadow-xs)]"
                    : "border-border bg-surface hover:border-secondary/40"
                }`}
                onClick={() => onSelectCategory(category.id)}
                type="button"
              >
                <span
                  className="mx-auto grid size-10 place-items-center text-secondary"
                  aria-hidden
                >
                  <CategoryIcon category={category} size={22} />
                </span>
                <p className="mt-2 text-sm font-semibold text-ink">{category.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {errors.category ? (
        <FormMessage variant="error">{errors.category}</FormMessage>
      ) : null}
    </Card>
  );
}
