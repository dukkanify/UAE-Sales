import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { assertStudentCanAccessQuiz, getQuizOrThrow } from "@/services/quizzes/access";
import {
  getQuizDetail,
  softDeleteQuiz,
  updateQuiz,
} from "@/services/quizzes/quiz-service";
import { listAttemptsForStudent } from "@/services/quizzes/attempt-service";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    ensureQuizzesSeeded();
    const user = await requireAuth();
    const { id } = await context.params;
    const detail = getQuizDetail(id);

    if (user.role === ROLES.STUDENT) {
      await requirePermission(PERMISSIONS.QUIZZES_OWN);
      assertStudentCanAccessQuiz(user, detail.quiz);
      const attempts = listAttemptsForStudent(user.id, id);
      return NextResponse.json({
        success: true,
        data: {
          quiz: detail.quiz,
          questionCount: detail.questions.length,
          attempts,
          // Hide correct answers for students on detail
          questions: detail.questions.map(({ link, question }) => ({
            link,
            question: {
              id: question.id,
              stem: question.stem,
              type: question.type,
              difficulty: question.difficulty,
              points: link.pointsOverride ?? question.points,
            },
          })),
        },
        error: null,
      });
    }

    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    return NextResponse.json({ success: true, data: detail, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { id } = await context.params;
    getQuizOrThrow(id);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const data = await updateQuiz({ user, id, patch: (body ?? {}) as never });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { id } = await context.params;
    await softDeleteQuiz(user, id);
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
