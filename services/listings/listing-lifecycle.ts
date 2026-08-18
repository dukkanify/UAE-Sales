import { createNotification } from "@/services/payments/notification-store";
import type { Listing } from "@/types";

export async function notifyListingSubmitted(listing: Listing): Promise<void> {
  await createNotification({
    userId: listing.seller.id,
    type: "listing_submitted",
    title: "تم استلام إعلانك",
    body: "تم استلام إعلانك وهو قيد المراجعة.",
    href: "/dashboard/listings",
  });
}

export async function notifyListingApproved(listing: Listing): Promise<void> {
  const href = listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
  await createNotification({
    userId: listing.seller.id,
    type: "listing_approved",
    title: "تمت الموافقة على إعلانك",
    body: "تمت الموافقة على إعلانك وأصبح منشورًا.",
    href,
  });
}

export async function notifyListingRejected(listing: Listing): Promise<void> {
  await createNotification({
    userId: listing.seller.id,
    type: "listing_rejected",
    title: "تم رفض إعلانك",
    body: "لم تتم الموافقة على إعلانك. يمكنك تعديله وإعادة إرساله من إعلاناتي.",
    href: "/dashboard/listings",
  });
}

export function needsFeaturedPayment(listing: Listing): boolean {
  return Boolean(listing.featuredRequested) && !listing.isFeatured;
}
