import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { listReminders, processDueReminders } from "@/services/classes/reminder-service";
import { classErrorResponse } from "@/app/api/classes/_utils";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.CLASSES_MANAGE);
    const { searchParams } = new URL(request.url);
    return NextResponse.json({
      success: true,
      data: listReminders({
        liveClassId: searchParams.get("liveClassId") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      }),
      error: null,
    });
  } catch (error) {
    return classErrorResponse(error);
  }
}

/** Process due reminder queue (cron-friendly). */
export async function POST() {
  try {
    await requirePermission(PERMISSIONS.CLASSES_MANAGE);
    const sent = await processDueReminders();
    return NextResponse.json({ success: true, data: { sent }, error: null });
  } catch (error) {
    return classErrorResponse(error);
  }
}
