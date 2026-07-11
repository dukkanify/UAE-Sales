import { getListingActionConfig } from "@/shared/constants/listingActionConfig";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import type { Listing, UserProfile } from "@/types";

export const CHECKOUT_ERRORS = {
  incompleteListing: "تعذر متابعة الطلب لأن بيانات الإعلان غير مكتملة.",
  ownListing: "لا يمكنك شراء إعلانك الخاص.",
  unavailable: "هذا الإعلان غير متاح للشراء حاليًا.",
  sessionRequired: "انتهت الجلسة. سجّل الدخول للمتابعة.",
  addressLoadFailed: "تعذر تحميل العناوين. حاول مرة أخرى.",
} as const;

export type CheckoutReviewValidation =
  | { ok: true }
  | { ok: false; message: string; redirectToLogin?: boolean };

export function validateCheckoutReviewStep(
  listing: Listing | null | undefined,
  buyer: UserProfile | null,
): CheckoutReviewValidation {
  if (!buyer) {
    return {
      ok: false,
      message: CHECKOUT_ERRORS.sessionRequired,
      redirectToLogin: true,
    };
  }

  if (!listing) {
    return { ok: false, message: CHECKOUT_ERRORS.incompleteListing };
  }

  if (
    !listing.seller?.id ||
    !listing.seller?.name ||
    !Number.isFinite(listing.price) ||
    listing.price <= 0
  ) {
    return { ok: false, message: CHECKOUT_ERRORS.incompleteListing };
  }

  if (listing.status !== "active") {
    return { ok: false, message: CHECKOUT_ERRORS.unavailable };
  }

  const config = getListingActionConfig(listing);
  if (!config.checkoutEnabled) {
    return { ok: false, message: CHECKOUT_ERRORS.unavailable };
  }

  if (isOwnListing(listing, buyer)) {
    return { ok: false, message: CHECKOUT_ERRORS.ownListing };
  }

  return { ok: true };
}
