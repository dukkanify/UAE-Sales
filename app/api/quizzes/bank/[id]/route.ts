import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  deleteQuestion,
  getQuestionById,
  updateQuestion,
} from "@/services/quizzes/question-bank-service";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { id } = await context.params;
    const data = getQuestionById(id);
    if (!data) {
      return NextResponse.json(
        { success: false, data: null, error: "Question not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const data = await updateQuestion({ user, id, patch: (body ?? {}) as never });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { id } = await context.params;
    await deleteQuestion(user, id);
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
