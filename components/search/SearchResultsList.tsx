"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { Card } from "@/components/ui/Card";
import { getLocalListings } from "@/services/clientStorage";

type SearchResultsListProps = {
  categoryId?: string;
  categories: Category[];
  listings: Listing[];
  selectedFilters?: {
    category?: string;
    city?: string;
    condition?: string;
    country?: string;
    maxPrice?: string;
    minPrice?: string;
    query?: string;
    sort?: string;
  };
};

export function SearchResultsList({
  categoryId,
  categories,
  listings,
  selectedFilters = {},
}: SearchResultsListProps) {
  const [localListings, setLocalListings] = useState<Listing[]>([]);
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const visibleListings = useMemo(() => {
    const normalizedQuery = selectedFilters.query?.trim().toLowerCase();
    const minPrice = selectedFilters.minPrice
      ? Number(selectedFilters.minPrice)
      : undefined;
    const maxPrice = selectedFilters.maxPrice
      ? Number(selectedFilters.maxPrice)
      : undefined;
    const filterCategory = categoryId || selectedFilters.category;

    const matchingLocalListings = localListings
      .filter((listing) => listing.status === "active")
      .filter((listing) =>
        filterCategory ? listing.categoryId === filterCategory : true,
      )
      .filter((listing) =>
        selectedFilters.city ? listing.city === selectedFilters.city : true,
      )
      .filter((listing) =>
        selectedFilters.country
          ? listing.country === selectedFilters.country
          : true,
      )
      .filter((listing) =>
        selectedFilters.condition
          ? listing.condition === selectedFilters.condition
          : true,
      )
      .filter((listing) =>
        typeof minPrice === "number" && Number.isFinite(minPrice)
          ? listing.price >= minPrice
          : true,
      )
      .filter((listing) =>
        typeof maxPrice === "number" && Number.isFinite(maxPrice)
          ? listing.price <= maxPrice
          : true,
      )
      .filter((listing) => {
        if (!normalizedQuery) {
          return true;
        }

        return [listing.title, listing.description, listing.city, listing.seller.name]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });

    const combinedListings = [...matchingLocalListings, ...listings];

    return combinedListings.sort((first, second) => {
      if (selectedFilters.sort === "price_asc") {
        return first.price - second.price;
      }

      if (selectedFilters.sort === "price_desc") {
        return second.price - first.price;
      }

      return second.id.localeCompare(first.id);
    });
  }, [categoryId, listings, localListings, selectedFilters]);

  useEffect(() => {
    const syncLocalListings = () => setLocalListings(getLocalListings());

    syncLocalListings();
    window.addEventListener("uae-sales-listings-change", syncLocalListings);

    return () =>
      window.removeEventListener("uae-sales-listings-change", syncLocalListings);
  }, []);

  if (visibleListings.length === 0) {
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
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
        >
          عرض كل الإعلانات
        </a>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {visibleListings.map((listing) => (
        <ListingCard
          key={listing.id}
          categoryName={categoryNames.get(listing.categoryId)}
          listing={listing}
        />
      ))}
    </div>
  );
}
