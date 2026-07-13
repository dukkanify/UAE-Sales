import type { Listing } from "@/types";
import { getListingActionConfig } from "@/shared/constants/listingActionConfig";

/** Listing is marked eligible for escrow when paid through the platform. */
export function isListingEscrowEligible(listing: Listing): boolean {
  return listing.escrowAvailable === true;
}

/** Integrated platform checkout is available for this listing. */
export function hasPlatformCheckout(listing: Listing): boolean {
  return getListingActionConfig(listing).checkoutEnabled;
}

/**
 * Escrow protection applies only when the listing is eligible AND
 * the buyer completes payment fully through the integrated checkout.
 */
export function showsEscrowProtection(listing: Listing): boolean {
  const config = getListingActionConfig(listing);
  return config.checkoutEnabled && isListingEscrowEligible(listing);
}

export const ESCROW_POLICY_SUMMARY =
  "الضمان المالي يطبق فقط على الإعلانات المؤهلة التي يتم شراؤها والدفع لها بالكامل عبر نظام الدفع المدمج في المنصة.";

export const ESCROW_ACTIVE_NOTICE =
  "هذا الإعلان مؤهل للضمان المالي. عند الشراء والدفع بالكامل داخل المنصة، يُحجز المبلغ بأمان حتى تأكيد الاستلام.";

export const INTERMEDIARY_NOTICE =
  "هذا إعلان عادي — المنصة تعمل كوسيط لعرض الإعلان وربط البائع بالمشتري فقط. لا يتوفر ضمان مالي أو حماية للدفع خارج نظام الشراء المدمج.";
