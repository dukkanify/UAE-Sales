import { getAdminSettings } from "@/services/admin/admin-settings-store";
import {
  completeFeaturedPaymentBySession,
  recordFeaturedPayment,
} from "@/services/listings/featured-payment-store";
import { notifyListingSubmitted } from "@/services/listings/listing-lifecycle";
import {
  getListingById,
  patchListingRecord,
  setListingFeatured,
} from "@/services/listings/listing-store";
import {
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";
import { createFeaturedCheckoutSession } from "@/services/payments/stripe.service";
import { findUserById } from "@/services/auth/user-store";
import type { Listing } from "@/types";

export type FeaturedCheckoutResult = {
  mode: "checkout" | "mock";
  listingId: string;
  checkoutUrl?: string;
  sessionId?: string;
  needsPayment?: boolean;
  listing?: Listing;
};

async function submitPaidFeaturedListing(listingId: string): Promise<Listing> {
  const featured = await setListingFeatured(listingId, true);
  if (!featured) {
    throw new Error("LISTING_NOT_FOUND");
  }

  if (featured.status === "draft") {
    const submitted = await patchListingRecord(listingId, {
      status: "pending_review",
    });
    if (!submitted) {
      throw new Error("LISTING_NOT_FOUND");
    }
    await notifyListingSubmitted(submitted);
    return submitted;
  }

  return featured;
}

export async function initiateFeaturedCheckout(
  listingId: string,
  userId: string,
  options?: { confirmMock?: boolean },
): Promise<FeaturedCheckoutResult> {
  const listing = await getListingById(listingId);
  if (!listing) {
    throw new Error("LISTING_NOT_FOUND");
  }
  if (listing.seller.id !== userId) {
    throw new Error("UNAUTHORIZED");
  }
  if (listing.isFeatured) {
    throw new Error("ALREADY_FEATURED");
  }

  const settings = await getAdminSettings();
  const amountAed = settings.featuredListingFeeAed;
  const days = settings.featuredListingDays;

  if (!isStripeConfigured()) {
    if (!options?.confirmMock || !isMockCheckoutAllowed()) {
      await recordFeaturedPayment({
        listingId,
        userId,
        amountAed,
        days,
        status: "pending",
        stripeSessionId: `mock-featured-pending-${listingId}`,
      });
      return {
        mode: "mock",
        listingId,
        needsPayment: true,
        listing,
      };
    }

    await recordFeaturedPayment({
      listingId,
      userId,
      amountAed,
      days,
      status: "completed",
      stripeSessionId: `mock-featured-${listingId}-${Date.now()}`,
      completedAt: new Date().toISOString(),
    });
    const updated = await submitPaidFeaturedListing(listingId);
    return {
      mode: "mock",
      listingId,
      listing: updated,
    };
  }

  const user = await findUserById(userId);
  const email = user?.email?.trim() || `${userId}@users.sooqna.site`;

  const session = await createFeaturedCheckoutSession({
    listingId,
    listingTitle: listing.title,
    userId,
    email,
    amountAed,
  });

  await recordFeaturedPayment({
    listingId,
    userId,
    amountAed,
    days,
    status: "pending",
    stripeSessionId: session.sessionId,
  });

  return {
    mode: "checkout",
    listingId,
    checkoutUrl: session.checkoutUrl,
    sessionId: session.sessionId,
    needsPayment: true,
    listing,
  };
}

export async function markListingFeatured(
  listingId: string,
  sessionId: string,
): Promise<Listing> {
  await completeFeaturedPaymentBySession(sessionId);
  return submitPaidFeaturedListing(listingId);
}
