import type { Category } from "@/types";
import { Card } from "@/shared/ui/Card";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Icon } from "@/shared/ui/Icon";
import type { ListingPreview } from "./types";
import { conditionLabels } from "./utils";

type ListingPreviewPanelProps = {
  imagePreviews: string[];
  preview: ListingPreview;
  selectedCategory?: Category;
};

export function ListingPreviewPanel({
  imagePreviews,
  preview,
  selectedCategory,
}: ListingPreviewPanelProps) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <Card className="p-5">
        <p className="text-sm font-semibold text-muted">معاينة الإعلان</p>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted">
          <div className="relative h-44">
            {imagePreviews[0] ? (
              <div
                aria-label="معاينة صورة الإعلان"
                className="absolute inset-0 bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${imagePreviews[0]})` }}
              />
            ) : (
              <div className="grid h-full place-items-center text-secondary">
                {selectedCategory ? (
                  <CategoryIcon category={selectedCategory} size={36} />
                ) : (
                  <Icon name="package" size={36} />
                )}
              </div>
            )}
            <span className="absolute start-4 top-4 rounded-[var(--radius-lg)] bg-surface/90 px-3 py-1 text-xs font-semibold text-primary">
              {selectedCategory?.name ?? "قسم"}
            </span>
          </div>
          <div className="bg-surface p-5">
            <h3 className="line-clamp-2 text-lg font-semibold leading-8 text-ink">
              {preview.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm font-medium leading-7 text-muted">
              {preview.description}
            </p>
            <div className="mt-4 flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
              <span className="text-lg font-semibold text-accent">
                {Number(preview.price || 0).toLocaleString("ar-AE")} د.إ
              </span>
              <span className="text-sm font-medium text-muted">{preview.city}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted">
              <span>{conditionLabels[preview.condition]}</span>
              <span>{imagePreviews.length} صور</span>
            </div>
          </div>
        </div>
      </Card>
    </aside>
  );
}
