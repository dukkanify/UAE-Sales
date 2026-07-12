import type { Listing, UserProfile } from "@/types";
import type { ShippingMethodId } from "@/types/domain/address";
import { getListingActionConfig } from "@/shared/constants/listingActionConfig";
import { isGuestCheckoutEnabled } from "@/shared/constants/feature-flags";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import { isValidUaePhone, normalizeUaePhone } from "@/shared/utils/phone";

export const CHECKOUT_ERRORS = {
  incompleteListing: "تعذر متابعة الطلب لأن بيانات الإعلان غير مكتملة.",
  ownListing: "لا يمكنك شراء إعلانك الخاص.",
  unavailable: "هذا الإعلان غير متاح للشراء حاليًا.",
  sessionRequired: "انتهت الجلسة. سجّل الدخول للمتابعة.",
  addressLoadFailed: "تعذر تحميل العناوين. حاول مرة أخرى.",
  invalidEmail: "اكتب بريدًا إلكترونيًا صحيحًا.",
  invalidPhone: "اكتب رقم هاتف إماراتي صحيحًا.",
  nameRequired: "الاسم الكامل مطلوب.",
  addressRequired: "أكمل بيانات العنوان للتوصيل.",
  buildingRequired: "اسم المبنى أو الفيلا مطلوب.",
  unitRequired: "رقم الشقة أو الوحدة مطلوب.",
} as const;

export type CheckoutReviewValidation =
  | { ok: true }
  | { ok: false; message: string; redirectToLogin?: boolean };

export type GuestBuyerInfo = {
  fullName: string;
  email: string;
  phone: string;
};

export type GuestDeliveryInfo = GuestBuyerInfo & {
  shippingMethod: ShippingMethodId;
  emirate?: string;
  city?: string;
  area?: string;
  street?: string;
  building?: string;
  unit?: string;
  landmark?: string;
  notes?: string;
  companyName?: string;
  saveAddress?: boolean;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateCheckoutReviewStep(
  listing: Listing | null | undefined,
  buyer: UserProfile | null,
): CheckoutReviewValidation {
  if (!buyer && !isGuestCheckoutEnabled()) {
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

  if (buyer && isOwnListing(listing, buyer)) {
    return { ok: false, message: CHECKOUT_ERRORS.ownListing };
  }

  return { ok: true };
}

export function validateGuestBuyerInfo(input: GuestBuyerInfo): string | null {
  if (input.fullName.trim().length < 2) {
    return CHECKOUT_ERRORS.nameRequired;
  }
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return CHECKOUT_ERRORS.invalidEmail;
  }
  if (!isValidUaePhone(input.phone)) {
    return CHECKOUT_ERRORS.invalidPhone;
  }
  return null;
}

export function validateGuestDeliveryStep(
  input: GuestDeliveryInfo,
  requiresAddress: boolean,
): string | null {
  const buyerError = validateGuestBuyerInfo(input);
  if (buyerError) return buyerError;

  if (!requiresAddress || input.shippingMethod === "pickup") {
    return null;
  }

  if (
    !input.emirate?.trim() ||
    !input.city?.trim() ||
    !input.area?.trim() ||
    !input.street?.trim() ||
    !input.building?.trim() ||
    !input.unit?.trim()
  ) {
    if (!input.building?.trim()) return CHECKOUT_ERRORS.buildingRequired;
    if (!input.unit?.trim()) return CHECKOUT_ERRORS.unitRequired;
    return CHECKOUT_ERRORS.addressRequired;
  }

  return null;
}

export function normalizeGuestBuyer(input: GuestBuyerInfo): GuestBuyerInfo {
  return {
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: normalizeUaePhone(input.phone),
  };
}
