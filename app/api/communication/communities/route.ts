import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  createCommunity,
  joinCommunity,
  listCommunities,
} from "@/services/communication/community-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { CommunityKind } from "@/types/communication";

export async function GET(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const kind = (searchParams.get("kind") as CommunityKind | "all" | null) ?? "all";
    const data = listCommunities(user, { kind });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const body = (await request.json().catch(() => null)) as {
      action?: "create" | "join";
      communityId?: string;
      name?: string;
      description?: string;
      kind?: CommunityKind;
      courseId?: string;
      subject?: string;
      batchLabel?: string;
      memberIds?: string[];
    } | null;

    if (body?.action === "join" && body.communityId) {
      return NextResponse.json({
        success: true,
        data: joinCommunity(user, body.communityId),
        error: null,
      });
    }

    const data = await createCommunity({
      user,
      name: body?.name ?? "New community",
      description: body?.description ?? "",
      kind: body?.kind ?? "general",
      courseId: body?.courseId,
      subject: body?.subject,
      batchLabel: body?.batchLabel,
      memberIds: body?.memberIds,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
