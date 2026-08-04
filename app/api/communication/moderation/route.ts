import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  listModerationLogs,
  listModerationRules,
  updateModerationRule,
} from "@/services/communication/moderation-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { ModerationAction } from "@/types/communication";

export async function GET() {
  try {
    ensureCommunicationSeeded();
    await requirePermission(PERMISSIONS.COMMUNITIES_MODERATE);
    return NextResponse.json({
      success: true,
      data: {
        rules: listModerationRules(),
        logs: listModerationLogs(100),
      },
      error: null,
    });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    await requirePermission(PERMISSIONS.COMMUNITIES_MODERATE);
    const body = (await request.json().catch(() => null)) as {
      ruleId?: string;
      enabled?: boolean;
      pattern?: string;
      action?: ModerationAction;
      description?: string;
    } | null;

    if (!body?.ruleId) {
      return NextResponse.json(
        { success: false, data: null, error: "ruleId required" },
        { status: 400 },
      );
    }

    const rule = updateModerationRule(body.ruleId, {
      enabled: body.enabled,
      pattern: body.pattern,
      action: body.action,
      description: body.description,
    });
    return NextResponse.json({ success: true, data: rule, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
