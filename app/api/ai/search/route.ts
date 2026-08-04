import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { aiSearch, ensureAiSeeded } from "@/services/ai";
import { aiErrorResponse } from "@/app/api/ai/_utils";

export async function GET(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const q = new URL(request.url).searchParams.get("q") ?? "";
    if (!q.trim()) {
      return NextResponse.json(
        { success: false, data: null, error: "q required" },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      data: aiSearch(user, q),
      error: null,
    });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
