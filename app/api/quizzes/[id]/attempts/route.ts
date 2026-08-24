import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { startAttempt } from "@/services/quizzes/attempt-service";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  try {
    ensureQuizzesSeeded();
    const user = await requirePermission(PERMISSIONS.QUIZZES_OWN);
    const { id } = await context.params;
    const data = await startAttempt({ user, quizId: id });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
