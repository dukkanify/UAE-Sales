import { getAdminSettings } from "@/services/admin/admin-settings-store";
import {
  completeFeaturedPaymentBySession,
  getFeaturedPayments,
  recordFeaturedPayment,
} from "@/services/listings/featured-payment-store";
import {
  getListingById,
  setListingFeatured,
} from "@/services/listings/listing-store";
import {
  ensureStripeConfigLoaded,
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";
import { createFeaturedCheckoutSession } from "@/services/payments/stripe.service";
import { findUserById } from "@/services/auth/user-store";
import {
  notifyListingFeaturedPaid,
  notifyListingSubmitted,
} from "@/services/listings/listing-notifications";

export type FeaturedCheckoutResult = {
  mode: "checkout" | "mock";
  listingId: string;
  checkoutUrl?: string;
  sessionId?: string;
  listing?: Awaited<ReturnType<typeof setListingFeatured>>;
};

export async function initiateFeaturedCheckout(
  listingId: string,
  userId: string,
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

  await ensureStripeConfigLoaded();
  if (!isStripeConfigured()) {
    if (!isMockCheckoutAllowed()) {
      throw new Error("STRIPE_NOT_CONFIGURED");
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
    const updated = await setListingFeatured(listingId, true, days);
    if (updated) {
      void notifyListingFeaturedPaid(updated);
    }
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
  };
}

export async function markListingFeatured(
  listingId: string,
  sessionId: string,
): Promise<Awaited<ReturnType<typeof setListingFeatured>>> {
  const existing = (await getFeaturedPayments()).find(
    (item) => item.stripeSessionId === sessionId,
  );
  const alreadyCompleted = existing?.status === "completed";

  const settings = await getAdminSettings();
  await completeFeaturedPaymentBySession(sessionId);
  const updated = await setListingFeatured(
    listingId,
    true,
    settings.featuredListingDays,
  );
  if (!updated) {
    throw new Error("LISTING_NOT_FOUND");
  }
  if (!alreadyCompleted) {
    void notifyListingFeaturedPaid(updated);
    if (updated.status === "pending_review") {
      void notifyListingSubmitted(updated);
    }
  }
  return updated;
}
