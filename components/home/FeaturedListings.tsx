import Link from "next/link";
import type { Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

type FeaturedListingsProps = {
  listings: Listing[];
};

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  return (
    <section className="app-container py-8">
      <SectionHeader
        eyebrow="إعلانات مميزة"
        title="مختارات نشطة من السوق"
        description="إعلانات حقيقية الشكل مع صور، أسعار، ضمان مالي، وحالة المنتج."
        action={
          <Link
            href="/search"
            className="text-sm font-black text-primary transition hover:text-primary-dark"
          >
            تصفح النتائج
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
