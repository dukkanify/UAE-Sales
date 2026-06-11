import type { Category, Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { Card } from "@/components/ui/Card";

type SearchResultsListProps = {
  categories: Category[];
  listings: Listing[];
};

export function SearchResultsList({
  categories,
  listings,
}: SearchResultsListProps) {
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  if (listings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary-soft text-3xl">
          🔎
        </div>
        <h2 className="mt-5 text-2xl font-black text-ink">
          لا توجد نتائج مطابقة
        </h2>
        <p className="mt-3 leading-8 text-muted">
          جرّب تعديل المدينة أو التصنيف أو نطاق السعر لعرض إعلانات أكثر.
        </p>
        <a
          href="/search"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-black text-white transition hover:bg-primary-dark"
        >
          عرض كل الإعلانات
        </a>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          categoryName={categoryNames.get(listing.categoryId)}
          listing={listing}
        />
      ))}
    </div>
  );
}
