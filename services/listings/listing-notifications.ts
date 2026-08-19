import { createNotification } from "@/services/payments/notification-store";
import {
  emailListingApproved,
  emailListingFeaturedPaid,
  emailListingReceived,
  emailListingRejected,
} from "@/services/email/notification-emails";
import type { Listing } from "@/types";

async function safeNotify(run: () => Promise<unknown>, label: string) {
  try {
    await run();
  } catch (error) {
    console.error(`[Sooqna Notify] ${label} failed`, error);
  }
}

export async function notifyListingSubmitted(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;

  await safeNotify(
    () =>
      createNotification({
        userId: sellerId,
        type: "listing_received",
        title: "تم استلام إعلانك",
        titleEn: "We received your listing",
        body: `إعلان «${listing.title}» قيد المراجعة وسيظهر بعد الموافقة.`,
        bodyEn: `“${listing.title}” is under review and will go live after approval.`,
        href: `/listings/${listing.slug}`,
      }),
    "listing_received in-app",
  );

  await safeNotify(() => emailListingReceived(listing), "listing_received email");
}

export async function notifyListingApproved(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;

  await safeNotify(
    () =>
      createNotification({
        userId: sellerId,
        type: "listing_approved",
        title: "تمت الموافقة على إعلانك",
        titleEn: "Your listing has been approved",
        body: `إعلان «${listing.title}» منشور الآن ويمكن للمشترين مشاهدته.`,
        bodyEn: `Your listing has been approved and is now live.`,
        href: `/listings/${listing.slug}`,
      }),
    "listing_approved in-app",
  );

  await safeNotify(() => emailListingApproved(listing), "listing_approved email");
}

export async function notifyListingRejected(
  listing: Listing,
  reason?: string,
): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;

  await safeNotify(
    () =>
      createNotification({
        userId: sellerId,
        type: "listing_rejected",
        title: "يحتاج إعلانك إلى تعديل",
        titleEn: "Your listing needs changes",
        body: reason
          ? `لم ننشر «${listing.title}»: ${reason}`
          : `لم ننشر إعلان «${listing.title}» بوضعه الحالي. عدّله ثم أعد الإرسال.`,
        bodyEn: reason
          ? `We could not publish “${listing.title}”: ${reason}`
          : `We could not publish “${listing.title}” in its current form. Edit it and resubmit.`,
        href: "/dashboard/listings",
      }),
    "listing_rejected in-app",
  );

  await safeNotify(
    () => emailListingRejected(listing, reason),
    "listing_rejected email",
  );
}

export async function notifyListingFeaturedPaid(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;

  await safeNotify(
    () =>
      createNotification({
        userId: sellerId,
        type: "listing_featured",
        title: "تم تمييز إعلانك",
        titleEn: "Your listing is now featured",
        body: `تم تأكيد دفع تمييز «${listing.title}» وسيظهر في الأقسام المميزة.`,
        bodyEn: `Featured payment for “${listing.title}” is confirmed. It will appear in featured sections.`,
        href: `/listings/${listing.slug}`,
      }),
    "listing_featured in-app",
  );

  await safeNotify(
    () => emailListingFeaturedPaid(listing),
    "listing_featured email",
  );
}
