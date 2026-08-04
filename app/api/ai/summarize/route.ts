import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAiSeeded, summarizeContent } from "@/services/ai";
import { aiErrorResponse } from "@/app/api/ai/_utils";
import type { AiContentKind } from "@/types/ai";

export async function POST(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      kind?: AiContentKind;
      targetId?: string | null;
      text?: string | null;
    };
    if (!body.kind) {
      return NextResponse.json(
        { success: false, data: null, error: "kind required" },
        { status: 400 },
      );
    }
    const result = summarizeContent({
      user,
      kind: body.kind,
      targetId: body.targetId,
      text: body.text,
    });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
