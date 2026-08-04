import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  createCategory,
  createQuestion,
  listCategories,
  listQuestions,
} from "@/services/quizzes/question-bank-service";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";
import type { QuestionDifficulty, QuestionType } from "@/types/quizzes";

export async function GET(request: Request) {
  try {
    ensureQuizzesSeeded();
    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { searchParams } = new URL(request.url);
    if (searchParams.get("categories") === "1") {
      return NextResponse.json({
        success: true,
        data: listCategories(),
        error: null,
      });
    }
    const data = listQuestions({
      q: searchParams.get("q") ?? undefined,
      type: (searchParams.get("type") as QuestionType | "all") ?? "all",
      difficulty: (searchParams.get("difficulty") as QuestionDifficulty | "all") ?? "all",
      categoryId: searchParams.get("categoryId") ?? undefined,
      subject: searchParams.get("subject") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 25),
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
    if (body.kind === "category") {
      const data = await createCategory({
        user,
        name: String(body.name ?? ""),
        subject: body.subject ? String(body.subject) : undefined,
        moduleLabel: body.moduleLabel ? String(body.moduleLabel) : undefined,
        description: body.description ? String(body.description) : undefined,
      });
      return NextResponse.json({ success: true, data, error: null });
    }
    const data = await createQuestion({
      user,
      stem: String(body.stem ?? ""),
      type: body.type,
      difficulty: body.difficulty,
      categoryId: (body.categoryId as string | null) ?? null,
      subject: body.subject ? String(body.subject) : undefined,
      moduleLabel: body.moduleLabel ? String(body.moduleLabel) : undefined,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
      options: body.options as never,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation ? String(body.explanation) : undefined,
      points: body.points != null ? Number(body.points) : undefined,
      externalId: (body.externalId as string | null) ?? null,
      externalSource: (body.externalSource as string | null) ?? null,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
