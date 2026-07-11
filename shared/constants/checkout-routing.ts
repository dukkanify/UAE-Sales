import type { Listing } from "@/types";
import { getListingActionConfig } from "@/shared/constants/listingActionConfig";

/** Categories that always include the checkout Delivery step when checkout is enabled. */
export const ALWAYS_DELIVERY_CHECKOUT_CATEGORIES = new Set([
  "cars",
  "electronics",
  "furniture",
  "fashion",
]);

/** Categories that may include Delivery unless marked pickup-only (non-car). */
export const OPTIONAL_DELIVERY_CHECKOUT_CATEGORIES = new Set([
  "mobiles",
  "kids",
  "sports",
  "books",
  "food",
]);

export const CHECKOUT_DELIVERY_CATEGORIES = new Set([
  ...ALWAYS_DELIVERY_CHECKOUT_CATEGORIES,
  ...OPTIONAL_DELIVERY_CHECKOUT_CATEGORIES,
]);

/** Categories that must never enter standard checkout. */
export const CHECKOUT_BLOCKED_CATEGORIES = new Set([
  "jobs",
  "real-estate",
  "services",
]);

export function categorySupportsCheckoutDelivery(categoryId: string): boolean {
  return CHECKOUT_DELIVERY_CATEGORIES.has(categoryId);
}

/**
 * Whether checkout should show the Delivery step before Payment.
 * Cars, electronics, furniture, and fashion always include Delivery.
 * Other shippable categories skip Delivery only when explicitly pickup-only.
 */
export function requiresCheckoutDeliveryStep(listing: Listing): boolean {
  const config = getListingActionConfig(listing);
  if (!config.checkoutEnabled) {
    return false;
  }

  if (!categorySupportsCheckoutDelivery(listing.categoryId)) {
    return false;
  }

  if (ALWAYS_DELIVERY_CHECKOUT_CATEGORIES.has(listing.categoryId)) {
    return true;
  }

  if (listing.deliveryOption === "pickup") {
    return false;
  }

  return true;
}

export type CheckoutCategoryRoute = {
  checkoutEnabled: boolean;
  primaryAction: string;
  requiresDeliveryStep: boolean;
};

export function getCheckoutCategoryRoute(listing: Listing): CheckoutCategoryRoute {
  const config = getListingActionConfig(listing);
  return {
    checkoutEnabled: config.checkoutEnabled,
    primaryAction: config.primaryAction,
    requiresDeliveryStep: requiresCheckoutDeliveryStep(listing),
  };
}
