import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  createGroupConversation,
  listConversationsForUser,
  conversationUnreadCount,
  startDirectConversation,
} from "@/services/communication/messaging-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { ConversationKind } from "@/types/communication";

export async function GET() {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    const conversations = listConversationsForUser(user).map((c) => ({
      ...c,
      unreadCount: conversationUnreadCount(user, c.id),
    }));
    return NextResponse.json({ success: true, data: conversations, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    const body = (await request.json().catch(() => null)) as {
      peerUserId?: string;
      kind?: ConversationKind;
      title?: string;
      participantIds?: string[];
      courseId?: string;
      classId?: string;
    } | null;

    if (body?.peerUserId) {
      const conv = await startDirectConversation({ user, peerUserId: body.peerUserId });
      return NextResponse.json({ success: true, data: conv, error: null });
    }

    if (body?.kind && body.kind !== "direct") {
      const conv = await createGroupConversation({
        user,
        kind: body.kind,
        title: body.title ?? "Group",
        participantIds: body.participantIds ?? [],
        courseId: body.courseId,
        classId: body.classId,
      });
      return NextResponse.json({ success: true, data: conv, error: null });
    }

    return NextResponse.json(
      { success: false, data: null, error: "peerUserId or group kind required" },
      { status: 400 },
    );
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
