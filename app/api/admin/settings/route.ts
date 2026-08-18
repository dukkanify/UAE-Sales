import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/services/admin/admin-settings-store";

export async function GET() {
  const admin = await requireAdminPermission("settings");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const settings = await getAdminSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminPermission("settings");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const settings = await updateAdminSettings({
    platformFeePercent:
      typeof body.platformFeePercent === "number"
        ? body.platformFeePercent
        : undefined,
    gatewayFeePercent:
      typeof body.gatewayFeePercent === "number"
        ? body.gatewayFeePercent
        : undefined,
    gatewayFeeFixed:
      typeof body.gatewayFeeFixed === "number"
        ? body.gatewayFeeFixed
        : undefined,
    maintenanceMode:
      typeof body.maintenanceMode === "boolean"
        ? body.maintenanceMode
        : undefined,
    allowGuestCheckout:
      typeof body.allowGuestCheckout === "boolean"
        ? body.allowGuestCheckout
        : undefined,
    escrowHoldDays:
      typeof body.escrowHoldDays === "number" ? body.escrowHoldDays : undefined,
    disputeWindowDays:
      typeof body.disputeWindowDays === "number"
        ? body.disputeWindowDays
        : undefined,
    listingActiveDays:
      typeof body.listingActiveDays === "number"
        ? body.listingActiveDays
        : undefined,
    listingReviewRequired:
      typeof body.listingReviewRequired === "boolean"
        ? body.listingReviewRequired
        : undefined,
    featuredListingFeeAed:
      typeof body.featuredListingFeeAed === "number"
        ? body.featuredListingFeeAed
        : undefined,
    featuredListingDays:
      typeof body.featuredListingDays === "number"
        ? body.featuredListingDays
        : undefined,
    supportEmail:
      typeof body.supportEmail === "string" ? body.supportEmail : undefined,
    stripeDashboardUrl:
      typeof body.stripeDashboardUrl === "string"
        ? body.stripeDashboardUrl
        : undefined,
  });

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "settings_update",
    targetType: "settings",
    targetId: "site",
    detail: `رسوم ${settings.platformFeePercent}% · صيانة ${
      settings.maintenanceMode ? "نعم" : "لا"
    } · ضيوف ${settings.allowGuestCheckout ? "نعم" : "لا"}`,
  });

  return NextResponse.json({ settings });
}
