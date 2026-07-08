"use client";

import type { Category } from "@/types";
import { EscrowProtectionCard } from "@/features/listings/components/EscrowProtectionCard";
import { ListingGallery } from "@/features/listings/components/ListingGallery";
import { ListingSpecifications } from "@/features/listings/components/ListingSpecifications";
import { ListingSummary } from "@/features/listings/components/ListingSummary";
import { SellerPanel } from "@/features/listings/components/SellerPanel";
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
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div>
        <ListingGallery listing={listing} />
      </div>
      <div className="grid gap-4">
        <ListingSummary category={category} listing={listing} />
        <SellerPanel listing={listing} />
        <EscrowProtectionCard />
      </div>
      <div className="lg:col-span-2">
        <div className="marketplace-panel p-6">
          <h2 className="text-lg font-black text-ink">وصف الإعلان</h2>
          <p className="mt-4 text-sm font-medium leading-8 text-muted">
            {listing.description}
          </p>
          <Button
            className="mt-4"
            href={`/listings/local/${listingId}/edit`}
            size="sm"
            variant="secondary"
          >
            تعديل الإعلان
          </Button>
        </div>
        <ListingSpecifications listing={listing} />
      </div>
    </div>
  );
}
