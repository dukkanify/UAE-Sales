import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import {
  createQuiz,
  listPublishedQuizzesForStudent,
  listQuizzes,
} from "@/services/quizzes/quiz-service";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";
import { parsePagination } from "@/lib/api/envelope";

export async function GET(request: Request) {
  try {
    ensureQuizzesSeeded();
    const user = await requireAuth();
    const url = new URL(request.url);
    const { searchParams } = url;
    const p = parsePagination(url);

    if (user.role === ROLES.STUDENT) {
      await requirePermission(PERMISSIONS.QUIZZES_OWN);
      return NextResponse.json({
        success: true,
        data: listPublishedQuizzesForStudent(user.id),
        error: null,
      });
    }

    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const data = listQuizzes({
      q: p.q,
      status: (searchParams.get("status") as "draft" | "published" | "archived" | "all") ?? "all",
      courseId: searchParams.get("courseId") ?? undefined,
      page: p.page,
      pageSize: p.pageSize,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureQuizzesSeeded();
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const data = await createQuiz({
      user,
      title: String(body.title ?? ""),
      description: body.description ? String(body.description) : undefined,
      courseId: (body.courseId as string | null) ?? null,
      moduleId: (body.moduleId as string | null) ?? null,
      lessonId: (body.lessonId as string | null) ?? null,
      passingScore: body.passingScore != null ? Number(body.passingScore) : undefined,
      totalMarks: body.totalMarks != null ? Number(body.totalMarks) : undefined,
      timeLimitMinutes: body.timeLimitMinutes != null ? Number(body.timeLimitMinutes) : undefined,
      maxAttempts: body.maxAttempts != null ? Number(body.maxAttempts) : undefined,
      instructions: body.instructions ? String(body.instructions) : undefined,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
