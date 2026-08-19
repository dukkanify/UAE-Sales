import { NextResponse } from "next/server";
import { getAdminSettings } from "@/services/admin/admin-settings-store";

export const dynamic = "force-dynamic";

/** Public site flags used by storefront (no secrets). */
export async function GET() {
  const settings = await getAdminSettings();
  return NextResponse.json(
    {
      settings: {
        maintenanceMode: settings.maintenanceMode,
        allowGuestCheckout: settings.allowGuestCheckout,
        supportEmail: settings.supportEmail,
        escrowHoldDays: settings.escrowHoldDays,
        disputeWindowDays: settings.disputeWindowDays,
        listingActiveDays: settings.listingActiveDays,
        featuredListingFeeAed: settings.featuredListingFeeAed,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
