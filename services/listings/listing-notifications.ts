import { createNotification } from "@/services/payments/notification-store";
import {
  emailListingApproved,
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
        body: `إعلان «${listing.title}» قيد المراجعة وسيظهر بعد الموافقة.`,
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
        body: `إعلان «${listing.title}» منشور الآن ويمكن للمشترين مشاهدته.`,
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
        body: reason
          ? `لم ننشر «${listing.title}»: ${reason}`
          : `لم ننشر إعلان «${listing.title}» بوضعه الحالي. عدّله ثم أعد الإرسال.`,
        href: "/dashboard/listings",
      }),
    "listing_rejected in-app",
  );

  await safeNotify(
    () => emailListingRejected(listing, reason),
    "listing_rejected email",
  );
}
