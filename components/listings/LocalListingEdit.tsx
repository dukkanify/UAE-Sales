"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Listing } from "@/types";
import { Card } from "@/components/ui/Card";
import { getLocalListingById } from "@/services/clientStorage";

type LocalListingEditProps = {
  listingId: string;
};

export function LocalListingEdit({ listingId }: LocalListingEditProps) {
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    setListing(getLocalListingById(listingId) ?? null);
  }, [listingId]);

  return (
    <Card className="p-8">
      <h1 className="text-3xl font-black text-ink">تعديل الإعلان</h1>
      <p className="mt-3 leading-8 text-muted">
        {listing
          ? `واجهة تعديل الإعلان "${listing.title}" جاهزة. يمكن تطويرها لاحقاً لتحديث localStorage أو API.`
          : "الإعلان المحلي غير موجود في هذا المتصفح."}
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-black text-white"
        href="/dashboard/listings"
      >
        العودة إلى إعلاناتي
      </Link>
    </Card>
  );
}
