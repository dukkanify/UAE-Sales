import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  archiveQuiz,
  duplicateQuiz,
  publishQuiz,
  setQuizQuestions,
  unpublishQuiz,
} from "@/services/quizzes/quiz-service";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      questionIds?: string[];
    } | null;
    const action = body?.action;
    if (!action) {
      return NextResponse.json(
        { success: false, data: null, error: "action required" },
        { status: 400 },
      );
    }

    switch (action) {
      case "publish":
        return NextResponse.json({
          success: true,
          data: await publishQuiz(user, id),
          error: null,
        });
      case "unpublish":
        return NextResponse.json({
          success: true,
          data: await unpublishQuiz(user, id),
          error: null,
        });
      case "archive":
        return NextResponse.json({
          success: true,
          data: await archiveQuiz(user, id),
          error: null,
        });
      case "duplicate":
        return NextResponse.json({
          success: true,
          data: await duplicateQuiz(user, id),
          error: null,
        });
      case "set_questions":
        return NextResponse.json({
          success: true,
          data: await setQuizQuestions({
            user,
            quizId: id,
            questionIds: body?.questionIds ?? [],
          }),
          error: null,
        });
      default:
        return NextResponse.json(
          { success: false, data: null, error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    return quizErrorResponse(error);
  }
}
