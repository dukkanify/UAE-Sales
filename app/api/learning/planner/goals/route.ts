import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  createGoal,
  listGoals,
  suggestAiGoalPlaceholder,
  syncGoalHoursFromProgress,
} from "@/services/learning/planner-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";
import type { StudyGoalPeriod } from "@/types/learning";

export async function GET(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    syncGoalHoursFromProgress(user.id);
    const { searchParams } = new URL(request.url);
    if (searchParams.get("suggest") === "1") {
      return NextResponse.json({
        success: true,
        data: { suggestion: suggestAiGoalPlaceholder(user.id), goals: listGoals(user.id) },
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: listGoals(user.id),
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const body = (await request.json().catch(() => null)) as {
      title?: string;
      period?: StudyGoalPeriod;
      targetHours?: number;
      aiSuggested?: boolean;
    } | null;
    if (!body?.period || !body.targetHours) {
      return NextResponse.json(
        { success: false, data: null, error: "period and targetHours required" },
        { status: 400 },
      );
    }
    const data = await createGoal({
      user,
      title: body.title ?? "",
      period: body.period,
      targetHours: body.targetHours,
      aiSuggested: body.aiSuggested,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
