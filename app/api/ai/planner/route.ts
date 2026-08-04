import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import {
  acceptStudyPlan,
  ensureAiSeeded,
  generateStudyPlan,
  listAiStudyPlans,
  updateStudyPlan,
} from "@/services/ai";
import { aiErrorResponse } from "@/app/api/ai/_utils";
import type { AiPlanHorizon, AiStudyPlanItem } from "@/types/ai";

export async function GET() {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    return NextResponse.json({
      success: true,
      data: listAiStudyPlans(user),
      error: null,
    });
  } catch (error) {
    return aiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureAiSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      action?: string;
      horizon?: AiPlanHorizon;
      planId?: string;
      items?: AiStudyPlanItem[];
      title?: string;
    };

    if (body.action === "accept" && body.planId) {
      const data = await acceptStudyPlan({ user, planId: body.planId });
      return NextResponse.json({ success: true, data, error: null });
    }
    if (body.action === "update" && body.planId) {
      const data = await updateStudyPlan({
        user,
        planId: body.planId,
        items: body.items,
        title: body.title,
      });
      return NextResponse.json({ success: true, data, error: null });
    }

    const horizon = body.horizon ?? "weekly";
    const data = await generateStudyPlan({ user, horizon });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
