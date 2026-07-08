"use client";

import type { Listing } from "@/types";
import { getLocalListingById } from "@/services/storage";
import { ComingSoonPage } from "@/shared/components/ComingSoonPage";

type CheckoutContentProps = {
  catalogListing?: Listing;
  listingRef?: string;
};

export function CheckoutContent({
  catalogListing,
  listingRef,
}: CheckoutContentProps) {
  const localListing =
    typeof window !== "undefined" && listingRef?.startsWith("local-")
      ? (getLocalListingById(listingRef) ?? null)
      : null;

  const listing = localListing ?? catalogListing;
  const listingLabel = listing?.title ?? listingRef;

  const description = listingLabel
    ? `إتمام شراء «${listingLabel}» عبر الضمان المالي. واجهة الدفع جاهزة لتعرض السعر، رسوم الدفع الإلكتروني، والإجمالي.`
    : "واجهة الدفع جاهزة لتعرض سعر المنتج، رسوم الدفع الإلكتروني، والإجمالي مع توضيح حجز المبلغ في الضمان المالي.";

  const backHref = listing
    ? listing.id.startsWith("local-")
      ? `/listings/local/${listing.id}`
      : `/listings/${listing.slug}`
    : "/search";

  return (
    <ComingSoonPage
      actionHref={backHref}
      actionLabel={listing ? "العودة للإعلان" : "تصفح الإعلانات"}
      description={description}
      eyebrow="الدفع"
      title="إتمام الشراء بأمان"
    />
  );
}
