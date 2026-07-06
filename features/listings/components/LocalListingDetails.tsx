"use client";

import { useEffect, useState } from "react";
import type { Category, Listing } from "@/types";
import { EscrowProtectionCard } from "@/features/listings/components/EscrowProtectionCard";
import { ListingGallery } from "@/features/listings/components/ListingGallery";
import { ListingSummary } from "@/features/listings/components/ListingSummary";
import { SellerPanel } from "@/features/listings/components/SellerPanel";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
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
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setListing(getLocalListingById(listingId) ?? null);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [listingId]);

  if (listing === undefined) {
    return <ListingDetailSkeleton />;
  }

  if (listing === null) {
    return (
      <EmptyState
        actionHref="/dashboard/listings"
        actionLabel="إعلاناتي"
        description="الإعلان غير موجود في هذا المتصفح."
        icon="package"
        secondaryActionHref="/listings/new"
        secondaryActionLabel="إضافة إعلان"
        title="الإعلان غير موجود"
      />
    );
  }

  const category = categories.find((item) => item.id === listing.categoryId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <ListingGallery listing={listing} />
      <div className="grid gap-4">
        <ListingSummary category={category} listing={listing} />
        <SellerPanel listing={listing} />
        <EscrowProtectionCard />
      </div>
      <Card className="p-6 lg:col-span-2" variant="panel">
        <h2 className="text-h2">وصف الإعلان</h2>
        <p className="text-body mt-3">{listing.description}</p>
        <Button
          className="mt-4"
          href={`/listings/local/${listingId}/edit`}
          size="sm"
          variant="secondary"
        >
          تعديل الإعلان
        </Button>
      </Card>
    </div>
  );
}
