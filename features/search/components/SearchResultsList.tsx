"use client";

import { useEffect, useMemo, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { listingMatchesEmirate } from "@/shared/listings/listing-ownership";
import { listingMatchesQuery } from "@/shared/listings/listing-specs";
import type { Category, Listing } from "@/types";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { SearchResultsToolbar } from "@/features/search/components/SearchResultsToolbar";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import {
  getLocalListingsForSeller,
  getSessionUser,
} from "@/services/storage";

const PAGE_SIZE = 12;

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const resultsSignature = `${categoryId ?? ""}:${listings.length}:${JSON.stringify(selectedFilters)}`;
  const [activeSignature, setActiveSignature] = useState(resultsSignature);

  if (activeSignature !== resultsSignature) {
    setActiveSignature(resultsSignature);
    setVisibleCount(PAGE_SIZE);
  }

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
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
        selectedFilters.city
          ? listingMatchesEmirate(listing, selectedFilters.city)
          : true,
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
        return listingMatchesQuery(listing, normalizedQuery);
      });

    return [...matchingLocalListings, ...listings].sort((a, b) => {
      if (selectedFilters.sort === "price_asc") return a.price - b.price;
      if (selectedFilters.sort === "price_desc") return b.price - a.price;
      return b.id.localeCompare(a.id);
    });
  }, [categoryId, listings, localListings, selectedFilters]);

  useEffect(() => {
    const syncLocalListings = () => {
      const user = getSessionUser();
      setLocalListings(
        user ? getLocalListingsForSeller(user.id) : [],
      );
    };

    syncLocalListings();
    window.addEventListener(STORAGE_EVENTS.listingsChange, syncLocalListings);
    window.addEventListener(STORAGE_EVENTS.sessionChange, syncLocalListings);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.listingsChange, syncLocalListings);
      window.removeEventListener(STORAGE_EVENTS.sessionChange, syncLocalListings);
    };
  }, []);

  if (visibleListings.length === 0) {
    return (
      <>
        <SearchResultsToolbar
          categories={categories}
          resultCount={0}
          selectedFilters={selectedFilters}
        />
        <EmptyState
          actionHref="/search"
          actionLabel="عرض كل الإعلانات"
          description="جرّب تعديل الفلاتر أو البحث بكلمات مختلفة. يمكنك أيضاً حفظ البحث للمرة القادمة."
          eyebrow="لا نتائج"
          icon="search"
          title="لم نجد إعلانات مطابقة"
        />
      </>
    );
  }

  const pageItems = visibleListings.slice(0, visibleCount);
  const hasMore = visibleCount < visibleListings.length;

  return (
    <>
      <SearchResultsToolbar
        categories={categories}
        resultCount={visibleListings.length}
        selectedFilters={selectedFilters}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 page-enter">
        {pageItems.map((listing) => (
          <ListingCard
            key={listing.id}
            categoryName={categoryNames.get(listing.categoryId)}
            listing={listing}
          />
        ))}
      </div>
      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            size="md"
            variant="secondary"
          >
            عرض المزيد ({visibleListings.length - visibleCount})
          </Button>
        </div>
      ) : null}
    </>
  );
}
