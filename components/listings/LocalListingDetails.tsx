"use client";

import { useEffect, useState } from "react";
import type { Category, Listing } from "@/types";
import { EscrowProtectionCard } from "@/components/listings/EscrowProtectionCard";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingSummary } from "@/components/listings/ListingSummary";
import { SellerPanel } from "@/components/listings/SellerPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLocalListingById } from "@/services/clientStorage";

type LocalListingDetailsProps = {
  categories: Category[];
  listingId: string;
};

export function LocalListingDetails({
  categories,
  listingId,
}: LocalListingDetailsProps) {
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setListing(getLocalListingById(listingId) ?? null);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [listingId]);

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
      <ListingGallery listing={listing} />
      <div className="grid gap-4">
        <ListingSummary category={category} listing={listing} />
        <SellerPanel listing={listing} />
        <EscrowProtectionCard />
      </div>
      <Card className="p-6 lg:col-span-2">
        <h2 className="text-lg font-black text-ink">وصف الإعلان</h2>
        <p className="mt-3 text-sm font-medium leading-8 text-muted">
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
      </Card>
    </div>
  );
}
