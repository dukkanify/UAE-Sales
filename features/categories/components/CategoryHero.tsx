import Link from "next/link";
import type { Category } from "@/types";
import { PremiumListingCard } from "@/features/listings/components/PremiumListingCard";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { getListingBySlug } from "@/services/listings";

type CategoryHeroProps = {
  category: Category;
};

export async function CategoryHero({ category }: CategoryHeroProps) {
  const featuredListing = category.featuredListingSlug
    ? await getListingBySlug(category.featuredListingSlug)
    : undefined;

  return (
    <div className="mb-8 overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-white shadow-[var(--shadow-card)]">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[12rem] lg:min-h-[16rem]">
          <AppImage
            alt={category.name}
            className="object-cover"
            fallbackCategory={category.id}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={category.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <Badge variant="featured">{category.name}</Badge>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-white/80">
              {category.listingCount.toLocaleString("ar-AE")} إعلان نشط في هذا
              القسم
            </p>
          </div>
        </div>

        {featuredListing ? (
          <div className="border-t border-border p-4 lg:border-s lg:border-t-0 lg:p-5">
            <p className="mb-3 text-xs font-bold text-[#B8955F]">إعلان مميز</p>
            <PremiumListingCard listing={featuredListing} />
            <Link
              className="mt-3 inline-block text-xs font-semibold text-primary"
              href={`/listings/${featuredListing.slug}`}
            >
              عرض التفاصيل الكاملة
            </Link>
          </div>
        ) : (
          <div className="grid place-items-center border-t border-border p-8 lg:border-s lg:border-t-0">
            <p className="text-sm text-muted">تصفح أحدث الإعلانات في هذا القسم</p>
          </div>
        )}
      </div>
    </div>
  );
}
