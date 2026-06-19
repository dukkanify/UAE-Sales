"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category, Listing } from "@/types";
import { EscrowProtectionCard } from "@/components/listings/EscrowProtectionCard";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingSummary } from "@/components/listings/ListingSummary";
import { SellerPanel } from "@/components/listings/SellerPanel";
import { Card } from "@/components/ui/Card";
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
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-black text-ink">الإعلان غير موجود</h1>
        <p className="mt-3 text-muted">
          ربما تم حذف الإعلان من التخزين المحلي في هذا المتصفح.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-secondary px-5 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          href="/dashboard/listings"
        >
          العودة إلى إعلاناتي
        </Link>
      </Card>
    );
  }

  const category = categories.find((item) => item.id === listing.categoryId);

  return (
    <div className="grid gap-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <ListingGallery listing={listing} />
        <div className="grid gap-5">
          <ListingSummary category={category} listing={listing} />
          <SellerPanel listing={listing} />
          <EscrowProtectionCard />
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-black text-ink">وصف الإعلان</h2>
        <p className="mt-3 leading-9 text-muted">{listing.description}</p>
      </Card>
    </div>
  );
}
