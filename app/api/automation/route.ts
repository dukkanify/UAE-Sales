import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import {
  AutomationCenterError,
  configureAutomationDomain,
  getAutomationCenterOverview,
  setPlatformMaintenance,
} from "@/services/automation/automation-center-service";
import { AUTOMATION_DOMAINS, type AutomationDomain } from "@/types/automation-center";

function errorResponse(error: unknown) {
  if (error instanceof AutomationCenterError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "Automation Center request failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== ROLES.SUPER_ADMIN) {
      throw new PermissionError("Super Admin access required", 403);
    }
    assertPermission(user, PERMISSIONS.SYSTEM_SETTINGS);
    return NextResponse.json({
      success: true,
      data: getAutomationCenterOverview(),
      error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== ROLES.SUPER_ADMIN) {
      throw new PermissionError("Super Admin access required", 403);
    }
    assertPermission(user, PERMISSIONS.SYSTEM_SETTINGS);

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      domain?: string;
      patch?: Record<string, string | number | boolean | null>;
      maintenanceMode?: boolean;
    };

    if (body.action === "configure") {
      if (!body.domain || !body.patch || typeof body.patch !== "object") {
        return NextResponse.json(
          { success: false, data: null, error: "domain and patch required" },
          { status: 400 },
        );
      }
      if (!(AUTOMATION_DOMAINS as readonly string[]).includes(body.domain)) {
        return NextResponse.json(
          { success: false, data: null, error: "Unknown domain" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await configureAutomationDomain({
          domain: body.domain as AutomationDomain,
          patch: body.patch,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (body.action === "maintenance") {
      if (typeof body.maintenanceMode !== "boolean") {
        return NextResponse.json(
          { success: false, data: null, error: "maintenanceMode required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await setPlatformMaintenance({
          maintenanceMode: body.maintenanceMode,
          actorId: user.id,
        }),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
