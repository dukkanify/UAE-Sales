import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  createGroupConversation,
  getOrCreateSupportConversation,
  heartbeatPresence,
  listConversationsForUser,
  conversationUnreadCount,
  startDirectConversation,
  totalUnreadMessages,
} from "@/services/communication/messaging-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { ConversationKind } from "@/types/communication";

export async function GET(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    heartbeatPresence(user.id);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const conversations = listConversationsForUser(user, { q }).map((c) => ({
      ...c,
      unreadCount: conversationUnreadCount(user, c.id),
    }));
    return NextResponse.json({
      success: true,
      data: {
        conversations,
        totalUnread: totalUnreadMessages(user),
      },
      error: null,
    });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    heartbeatPresence(user.id);
    const body = (await request.json().catch(() => null)) as {
      peerUserId?: string;
      kind?: ConversationKind;
      title?: string;
      participantIds?: string[];
      courseId?: string;
      classId?: string;
      support?: boolean;
    } | null;

    if (body?.support) {
      const conv = await getOrCreateSupportConversation(user);
      return NextResponse.json({ success: true, data: conv, error: null });
    }

    if (body?.peerUserId) {
      const conv = await startDirectConversation({ user, peerUserId: body.peerUserId });
      return NextResponse.json({ success: true, data: conv, error: null });
    }

    if (body?.kind && body.kind !== "direct" && body.kind !== "support") {
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
      { success: false, data: null, error: "peerUserId, support, or group kind required" },
      { status: 400 },
    );
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
