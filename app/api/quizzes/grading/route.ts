import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  finalizeAttemptReview,
  getAttemptById,
  getAnswersForAttempt,
  listAttemptsForQuiz,
  manualGradeAnswer,
} from "@/services/quizzes/attempt-service";
import { getQuestionById } from "@/services/quizzes/question-bank-service";
import { getQuizOrThrow } from "@/services/quizzes/access";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");
    const attemptId = searchParams.get("attemptId");
    const pendingOnly = searchParams.get("pending") === "1";

    if (attemptId) {
      const attempt = getAttemptById(attemptId);
      if (!attempt) {
        return NextResponse.json(
          { success: false, data: null, error: "Attempt not found" },
          { status: 404 },
        );
      }
      const answers = getAnswersForAttempt(attemptId).map((a) => ({
        ...a,
        question: getQuestionById(a.questionId),
      }));
      return NextResponse.json({
        success: true,
        data: { attempt, quiz: getQuizOrThrow(attempt.quizId), answers },
        error: null,
      });
    }

    if (!quizId) {
      return NextResponse.json(
        { success: false, data: null, error: "quizId or attemptId required" },
        { status: 400 },
      );
    }
    let attempts = listAttemptsForQuiz(quizId);
    if (pendingOnly) {
      attempts = attempts.filter((a) => a.gradeStatus === "needs_review");
    }
    return NextResponse.json({ success: true, data: attempts, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const body = (await request.json().catch(() => null)) as {
      action?: "grade_answer" | "finalize";
      attemptId?: string;
      questionId?: string;
      score?: number;
      feedback?: string;
      comments?: string;
      scoreAdjustment?: number;
      approved?: boolean;
    } | null;

    if (!body?.attemptId || !body.action) {
      return NextResponse.json(
        { success: false, data: null, error: "action and attemptId required" },
        { status: 400 },
      );
    }

    if (body.action === "grade_answer") {
      if (!body.questionId || body.score == null) {
        return NextResponse.json(
          { success: false, data: null, error: "questionId and score required" },
          { status: 400 },
        );
      }
      const data = await manualGradeAnswer({
        user,
        attemptId: body.attemptId,
        questionId: body.questionId,
        score: Number(body.score),
        feedback: body.feedback,
      });
      return NextResponse.json({ success: true, data, error: null });
    }

    const data = await finalizeAttemptReview({
      user,
      attemptId: body.attemptId,
      comments: body.comments,
      scoreAdjustment: body.scoreAdjustment,
      approved: body.approved,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
