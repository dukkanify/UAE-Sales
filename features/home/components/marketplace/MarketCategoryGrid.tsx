import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import {
  MOBILE_CATEGORY_PAGE_ORDER,
  MOBILE_MAIN_CATEGORY_LABELS,
} from "@/features/home/components/mobile/mobile-home.config";

type MarketCategoryGridProps = {
  categories: Category[];
};

function getMarketCategories(categories: Category[]): Category[] {
  const byId = new Map(categories.map((item) => [item.id, item]));
  return MOBILE_CATEGORY_PAGE_ORDER.flat()
    .map((id) => byId.get(id))
    .filter((item): item is Category => Boolean(item));
}

export function MarketCategoryGrid({ categories }: MarketCategoryGridProps) {
  const items = getMarketCategories(categories);

  if (items.length === 0) return null;

  return (
    <section aria-label="التصنيفات" className="border-b border-border/50 bg-[#fdfbf7] py-8 md:py-10">
      <div className="app-container px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-secondary">السوق</p>
            <h2 className="mt-1 text-xl font-bold text-ink md:text-2xl">تصفّح حسب التصنيف</h2>
          </div>
          <Link
            className="shrink-0 text-sm font-bold text-secondary transition hover:text-[#9a7d4a]"
            href="/categories"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-x-3 gap-y-5 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-10 lg:gap-x-4">
          {items.map((category) => (
            <Link
              key={category.id}
              className="group flex min-w-0 flex-col items-center gap-2 text-center"
              href={`/categories/${category.slug}`}
            >
              <span className="relative size-[4.25rem] overflow-hidden rounded-2xl border-2 border-white bg-surface-muted shadow-[0_8px_20px_rgb(15_23_42/9%)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_28px_rgb(15_23_42/12%)] md:size-[4.75rem]">
                <AppImage
                  alt=""
                  aria-hidden
                  className="object-cover"
                  fallbackCategory={category.id}
                  fill
                  sizes="(max-width: 768px) 68px, 76px"
                  src={category.imageUrl}
                />
              </span>
              <span className="max-w-full truncate text-xs font-semibold text-ink">
                {MOBILE_MAIN_CATEGORY_LABELS[category.id] ?? category.name}
              </span>
            </Link>
          ))}

          <Link
            className="group flex min-w-0 flex-col items-center gap-2 text-center"
            href="/categories"
          >
            <span className="grid size-[4.25rem] place-items-center rounded-2xl border-2 border-white bg-primary text-secondary shadow-[0_8px_22px_rgb(15_23_42/18%)] transition duration-200 group-hover:-translate-y-0.5 md:size-[4.75rem]">
              <Icon aria-hidden name="grid" size={24} />
            </span>
            <span className="max-w-full truncate text-xs font-semibold text-ink">المزيد</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
