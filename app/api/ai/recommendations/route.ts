import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAiSeeded, getCourseRecommendations, listRecommendationHistory } from "@/services/ai";
import { aiErrorResponse } from "@/app/api/ai/_utils";

export async function GET(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    if (searchParams.get("view") === "history") {
      return NextResponse.json({
        success: true,
        data: listRecommendationHistory(user.id),
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: getCourseRecommendations(user),
      error: null,
    });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
