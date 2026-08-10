import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { PermissionError } from "@/services/auth/permissions";
import { AssignmentError } from "@/services/assignment/availability-service";
import { processWaitingQueue } from "@/services/assignment/engine";

/** Cron / ops endpoint to drain the instructor waiting queue. */
export async function POST() {
  try {
    const user = await requirePermission(PERMISSIONS.SCHEDULE_MANAGE_ALL).catch(async (err) => {
      if (err instanceof PermissionError) {
        return requirePermission(PERMISSIONS.INSTRUCTORS_ASSIGN);
      }
      throw err;
    });
    const result = await processWaitingQueue(user.id);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    if (error instanceof AssignmentError || error instanceof PermissionError) {
      return NextResponse.json(
        { success: false, data: null, error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { success: false, data: null, error: "Queue processing failed" },
      { status: 500 },
    );
  }
}
