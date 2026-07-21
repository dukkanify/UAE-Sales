import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/services/admin/admin-settings-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const settings = await getAdminSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const settings = await updateAdminSettings({
    platformFeePercent:
      typeof body.platformFeePercent === "number"
        ? body.platformFeePercent
        : undefined,
    gatewayFeePercent:
      typeof body.gatewayFeePercent === "number" ? body.gatewayFeePercent : undefined,
    gatewayFeeFixed:
      typeof body.gatewayFeeFixed === "number" ? body.gatewayFeeFixed : undefined,
    maintenanceMode:
      typeof body.maintenanceMode === "boolean" ? body.maintenanceMode : undefined,
    allowGuestCheckout:
      typeof body.allowGuestCheckout === "boolean"
        ? body.allowGuestCheckout
        : undefined,
    escrowHoldDays:
      typeof body.escrowHoldDays === "number" ? body.escrowHoldDays : undefined,
    supportEmail:
      typeof body.supportEmail === "string" ? body.supportEmail : undefined,
    stripeDashboardUrl:
      typeof body.stripeDashboardUrl === "string"
        ? body.stripeDashboardUrl
        : undefined,
  });

  await logAdminAction({
    actorId: typeof body.actorId === "string" ? body.actorId : "admin",
    actorName: typeof body.actorName === "string" ? body.actorName : "Admin",
    action: "settings_update",
    targetType: "settings",
    targetId: "site",
    detail: `رسوم ${settings.platformFeePercent}% · صيانة ${
      settings.maintenanceMode ? "نعم" : "لا"
    }`,
  });

  return NextResponse.json({ settings });
}
