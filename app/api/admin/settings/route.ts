import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import {
  getPlatformSettings,
  updatePlatformSettings,
  listSettingsHistory,
  type CategoryPatch,
} from "@/services/settings/settings-service";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { writeOpsLog } from "@/services/ops/logging-service";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const settings = getPlatformSettings();
    const history = listSettingsHistory(20);
    return NextResponse.json({
      success: true,
      data: { settings, history },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const body = (await request.json().catch(() => null)) as {
      patch?: CategoryPatch;
    } | null;

    if (!body?.patch || typeof body.patch !== "object") {
      return NextResponse.json(
        { success: false, data: null, error: "patch object is required" },
        { status: 400 },
      );
    }

    // Never echo password back after save if empty string meant "unchanged"
    const patch = { ...body.patch };
    if (patch.email?.smtpPassword === "") {
      delete patch.email.smtpPassword;
      if (Object.keys(patch.email).length === 0) delete patch.email;
    }

    const settings = await updatePlatformSettings({
      patch,
      actorId: user.id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    writeOpsLog({
      level: "info",
      category: "audit",
      message: "Platform settings updated",
      userId: user.id,
      path: "/api/admin/settings",
    });

    // Redact password in response
    const safe = structuredClone(settings);
    if (safe.email.smtpPassword) safe.email.smtpPassword = "********";

    return NextResponse.json({ success: true, data: { settings: safe }, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}
