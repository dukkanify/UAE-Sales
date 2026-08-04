import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAiSeeded, generateQuestions } from "@/services/ai";
import { aiErrorResponse } from "@/app/api/ai/_utils";
import type { AiDifficulty } from "@/types/ai";

export async function POST(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      topic?: string;
      difficulty?: AiDifficulty;
      count?: number;
    };
    const data = generateQuestions({
      user,
      topic: body.topic,
      difficulty: body.difficulty,
      count: body.count,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
