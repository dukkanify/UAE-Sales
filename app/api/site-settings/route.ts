import { NextResponse } from "next/server";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import {
  ensureStripeConfigLoaded,
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";

/** Public site flags used by storefront (no secrets). */
export async function GET() {
  await ensureStripeConfigLoaded();
  const settings = await getAdminSettings();
  return NextResponse.json({
    settings: {
      maintenanceMode: settings.maintenanceMode,
      allowGuestCheckout: settings.allowGuestCheckout,
      supportEmail: settings.supportEmail,
      escrowHoldDays: settings.escrowHoldDays,
      disputeWindowDays: settings.disputeWindowDays,
      listingActiveDays: settings.listingActiveDays,
      featuredListingFeeAed: settings.featuredListingFeeAed,
      featuredCheckoutAvailable:
        isStripeConfigured() || isMockCheckoutAllowed(),
    },
  });
}
