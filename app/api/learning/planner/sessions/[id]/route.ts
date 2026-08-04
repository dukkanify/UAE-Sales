import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { updateStudySession } from "@/services/learning/planner-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";
import type { StudySession } from "@/types/learning";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as Partial<
      Pick<StudySession, "title" | "completed" | "notes" | "scheduledStart" | "scheduledEnd">
    > | null;
    const data = await updateStudySession({
      user,
      id,
      patch: body ?? {},
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
