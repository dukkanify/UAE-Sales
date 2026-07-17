"use client";

import type { Category } from "@/types";
import { ListingDetailsView } from "@/features/listings/components/ListingDetailsView";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ListingDetailSkeleton } from "@/shared/ui/Skeleton";
import { getLocalListingById } from "@/services/storage";

type LocalListingDetailsProps = {
  categories: Category[];
  listingId: string;
};

export function LocalListingDetails({
  categories,
  listingId,
}: LocalListingDetailsProps) {
  if (typeof window === "undefined") {
    return <ListingDetailSkeleton />;
  }

  const listing = getLocalListingById(listingId) ?? null;

  if (!listing) {
    return (
      <EmptyState
        actionHref="/dashboard/listings"
        actionLabel="إعلاناتي"
        description="الإعلان غير موجود في هذا المتصفح."
        icon="package"
        title="الإعلان غير موجود"
      />
    );
  }

  const category = categories.find((item) => item.id === listing.categoryId);

  return (
    <>
      <ListingDetailsView
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/dashboard/listings", label: "إعلاناتي" },
          { label: listing.title },
        ]}
        category={category}
        listing={listing}
      />
      <div className="app-container -mt-20 pb-44 lg:pb-8">
        <Button
          href={`/listings/local/${listingId}/edit`}
          size="sm"
          variant="secondary"
        >
          تعديل الإعلان
        </Button>
      </div>
    </>
  );
}
