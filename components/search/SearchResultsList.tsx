"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
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
  const [isLoading, setIsLoading] = useState(true);
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
        if (!normalizedQuery) return true;
        return [listing.title, listing.description, listing.city, listing.seller.name]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });

    return [...matchingLocalListings, ...listings].sort((a, b) => {
      if (selectedFilters.sort === "price_asc") return a.price - b.price;
      if (selectedFilters.sort === "price_desc") return b.price - a.price;
      return b.id.localeCompare(a.id);
    });
  }, [categoryId, listings, localListings, selectedFilters]);

  useEffect(() => {
    const syncLocalListings = () => setLocalListings(getLocalListings());
    syncLocalListings();
    const timeoutId = window.setTimeout(() => setIsLoading(false), 300);
    window.addEventListener("uae-sales-listings-change", syncLocalListings);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("uae-sales-listings-change", syncLocalListings);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (visibleListings.length === 0) {
    return (
      <EmptyState
        actionHref="/search"
        actionLabel="عرض كل الإعلانات"
        description="جرّب تعديل الفلاتر أو البحث بكلمات مختلفة."
        icon="search"
        title="لا توجد نتائج"
      />
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
