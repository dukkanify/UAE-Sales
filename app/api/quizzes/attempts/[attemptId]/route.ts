import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import {
  getAttemptReviewPayload,
  listAttemptsForQuiz,
  saveAttemptAnswers,
  submitAttempt,
} from "@/services/quizzes/attempt-service";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

type Ctx = { params: Promise<{ attemptId: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const user = await requireAuth();
    const { attemptId } = await context.params;
    if (user.role === ROLES.STUDENT) {
      await requirePermission(PERMISSIONS.QUIZZES_OWN);
    } else {
      await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    }
    const data = getAttemptReviewPayload(user, attemptId);
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_OWN);
    const { attemptId } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      answers?: Array<{ questionId: string; response: unknown }>;
      timeSpentSeconds?: number;
      clientMeta?: Record<string, unknown>;
      suspicious?: { type: string; detail: string };
      submit?: boolean;
    } | null;

    if (body?.submit) {
      const data = await submitAttempt({
        user,
        attemptId,
        answers: body.answers,
        timeSpentSeconds: body.timeSpentSeconds,
      });
      return NextResponse.json({ success: true, data, error: null });
    }

    const data = await saveAttemptAnswers({
      user,
      attemptId,
      answers: body?.answers ?? [],
      timeSpentSeconds: body?.timeSpentSeconds,
      clientMeta: body?.clientMeta,
      suspicious: body?.suspicious,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

/** Instructor: list attempts for a quiz via query ?quizId= */
export async function PUT(request: Request) {
  try {
    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const body = (await request.json().catch(() => null)) as { quizId?: string } | null;
    if (!body?.quizId) {
      return NextResponse.json(
        { success: false, data: null, error: "quizId required" },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      data: listAttemptsForQuiz(body.quizId),
      error: null,
    });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
