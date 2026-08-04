import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { updateGoal } from "@/services/learning/planner-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";
import type { StudyGoal } from "@/types/learning";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as Partial<
      Pick<StudyGoal, "title" | "targetHours" | "completedHours" | "status">
    > | null;
    const data = await updateGoal({ user, id, patch: body ?? {} });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
