import Link from "next/link";
import { PremiumListingCard } from "@/features/listings/components/PremiumListingCard";
import { getCategories } from "@/services/categories";
import { getFeaturedListings } from "@/services/listings";

export async function MarketPreviewStrip() {
  const [categories, listings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const previews = listings.slice(0, 4);

  return (
    <section className="relative z-10 border-t border-[#B8955F]/10 bg-[#fdfbf7] py-10 md:py-14">
      <div className="app-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#B8955F]">معاينة السوق</p>
            <h2 className="mt-1 text-xl font-bold text-ink md:text-2xl">
              إعلانات مميزة الآن
            </h2>
          </div>
          <Link
            className="text-sm font-bold text-[#B8955F] hover:text-[#9a7d4a]"
            href="/featured"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previews.map((listing, index) => (
            <PremiumListingCard
              key={listing.id}
              categoryName={categoryMap.get(listing.categoryId)}
              listing={listing}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
