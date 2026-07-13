import type { Category } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
import { Card } from "@/shared/ui/Card";
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
          <div className="relative bg-gradient-to-b from-surface-muted to-[#e8edf3]">
            {imagePreviews[0] ? (
              <div className="flex min-h-44 items-center justify-center p-3 sm:min-h-52 sm:p-4">
                {/* Blob preview URLs from local file picks — native img keeps full image visible */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="معاينة صورة الإعلان"
                  className="mx-auto block max-h-80 w-auto max-w-full object-contain"
                  src={imagePreviews[0]}
                />
              </div>
            ) : (
              <div className="grid h-44 place-items-center sm:h-52">
                {selectedCategory ? (
                  <CategoryThumbnail category={selectedCategory} size="xl" />
                ) : (
                  <Icon className="text-secondary" name="package" size={36} />
                )}
              </div>
            )}
            <span className="pointer-events-none absolute start-4 top-4 z-10 rounded-[var(--radius-lg)] bg-surface/90 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-xs)] backdrop-blur-sm">
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
              <CurrencyAmount amount={Number(preview.price || 0)} size="md" />
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
