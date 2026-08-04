import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAiSeeded, generateWriting } from "@/services/ai";
import { aiErrorResponse } from "@/app/api/ai/_utils";
import type { WritingKind } from "@/services/ai/writing-service";

export async function POST(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      kind?: WritingKind;
      topic?: string;
      tone?: string;
    };
    if (!body.kind || !body.topic?.trim()) {
      return NextResponse.json(
        { success: false, data: null, error: "kind and topic required" },
        { status: 400 },
      );
    }
    const data = generateWriting({
      user,
      kind: body.kind,
      topic: body.topic,
      tone: body.tone,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
