import Link from "next/link";
import type { Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

type LatestListingsProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

export function LatestListings({ categories, listings }: LatestListingsProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <section className="section-padding bg-surface-muted/40">
      <div className="app-container">
        <SectionHeader
          action={
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-5 text-sm font-bold text-ink transition hover:bg-surface"
              href="/search"
            >
              عرض الكل
            </Link>
          }
          description="أحدث الإعلانات المنشورة في السوق — محدّثة باستمرار."
          eyebrow="وصل للتو"
          title="أحدث الإعلانات"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.slice(0, 8).map((listing) => (
            <ListingCard
              key={listing.id}
              categoryName={categoryMap.get(listing.categoryId)}
              listing={listing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
