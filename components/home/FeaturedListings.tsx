import Link from "next/link";
import type { Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

type FeaturedListingsProps = {
  listings: Listing[];
};

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  return (
    <section className="app-container py-12">
      <SectionHeader
        eyebrow="إعلانات مختارة"
        title="إعلانات مميزة جاهزة للعرض"
        description="بطاقات قابلة لإعادة الاستخدام تعرض السعر، المدينة، حالة المنتج، وتقييم البائع."
        action={
          <Link
            href="/search"
            className="text-sm font-black text-primary transition hover:text-primary-dark"
          >
            تصفح النتائج
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
