import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { getNearbyListings } from "@/features/home/components/mobile/mobile-home.config";
import { getListingHref, getListingImageUrl } from "@/features/listings/components/listing-card.utils";
import { MarketSectionHeader, MarketSectionShell } from "./MarketSectionHeader";

type MarketNearbySectionProps = {
  listings: Listing[];
};

export function MarketNearbySection({ listings }: MarketNearbySectionProps) {
  const nearby = getNearbyListings(listings, 6);

  if (nearby.length === 0) return null;

  return (
    <MarketSectionShell variant="white">
      <MarketSectionHeader
        actionHref="/search"
        actionLabel="عرض الكل"
        description="إعلانات قريبة من موقعك — تصفّح وتواصل بسرعة."
        eyebrow="Nearby"
        title="القريبة منك"
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {nearby.map(({ distance, listing }) => {
          const href = getListingHref(listing);
          const imageUrl = getListingImageUrl(listing);

          return (
            <Link
              key={listing.id}
              className="group overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgb(15_23_42/6%)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgb(15_23_42/10%)]"
              href={href}
            >
              <div className="relative aspect-square overflow-hidden">
                <AppImage
                  alt={listing.title}
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  fallbackCategory={listing.categoryId}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  src={imageUrl}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8 text-center text-xs font-bold text-white">
                  {distance}
                </span>
              </div>
              <p className="line-clamp-2 px-3 py-3 text-sm font-bold text-ink">{listing.title}</p>
            </Link>
          );
        })}
      </div>
    </MarketSectionShell>
  );
}
