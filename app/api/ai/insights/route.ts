import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import {
  canViewAiLogs,
  ensureAiSeeded,
  generateInsights,
  getUsageSummary,
  listAiLogs,
} from "@/services/ai";
import { AiError } from "@/services/ai/access";
import { aiErrorResponse } from "@/app/api/ai/_utils";

export async function GET(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const view = new URL(request.url).searchParams.get("view") ?? "insights";

    if (view === "logs") {
      if (!canViewAiLogs(user)) throw new AiError("AI logs restricted", 403);
      return NextResponse.json({
        success: true,
        data: listAiLogs(100),
        error: null,
      });
    }
    if (view === "usage") {
      if (!canViewAiLogs(user)) throw new AiError("AI usage restricted", 403);
      return NextResponse.json({
        success: true,
        data: getUsageSummary(),
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: generateInsights(user),
      error: null,
    });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
