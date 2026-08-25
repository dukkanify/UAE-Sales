import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  assertParticipant,
  deleteOwnMessage,
  forwardMessage,
  heartbeatPresence,
  listMessages,
  listPresence,
  listTyping,
  markConversationRead,
  pinMessage,
  reactToMessage,
  sendMessage,
  setConversationFlags,
  setTyping,
} from "@/services/communication/messaging-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { AttachmentRef, MessageReactionEmoji, MessageShareKind } from "@/types/communication";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    heartbeatPresence(user.id);
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const conv = assertParticipant(user, id);
    const messages = listMessages(user, id, {
      q: searchParams.get("q") ?? undefined,
      before: searchParams.get("before") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 50),
    });
    const typing = listTyping(id, user.id);
    const presence = listPresence(conv.participantIds);
    return NextResponse.json({
      success: true,
      data: { conversation: conv, messages, typing, presence },
      error: null,
    });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request, context: Ctx) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    heartbeatPresence(user.id);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      action?:
        | "send"
        | "read"
        | "typing"
        | "mute"
        | "archive"
        | "delete"
        | "delete_message"
        | "react"
        | "pin"
        | "forward";
      body?: string;
      attachments?: AttachmentRef[];
      muted?: boolean;
      archived?: boolean;
      messageId?: string;
      emoji?: MessageReactionEmoji;
      pinned?: boolean;
      replyToId?: string | null;
      shareKind?: MessageShareKind;
      peerUserId?: string;
    } | null;

    switch (body?.action) {
      case "send":
        return NextResponse.json({
          success: true,
          data: await sendMessage({
            user,
            conversationId: id,
            body: body.body ?? "",
            attachments: body.attachments,
            replyToId: body.replyToId,
            shareKind: body.shareKind,
          }),
          error: null,
        });
      case "read":
        markConversationRead(user, id);
        return NextResponse.json({ success: true, data: { ok: true }, error: null });
      case "typing":
        return NextResponse.json({
          success: true,
          data: setTyping(user, id),
          error: null,
        });
      case "mute":
        setConversationFlags(user, id, { muted: Boolean(body.muted) });
        return NextResponse.json({ success: true, data: { ok: true }, error: null });
      case "archive":
        setConversationFlags(user, id, { archived: Boolean(body.archived ?? true) });
        return NextResponse.json({ success: true, data: { ok: true }, error: null });
      case "delete":
        setConversationFlags(user, id, { delete: true });
        return NextResponse.json({ success: true, data: { ok: true }, error: null });
      case "delete_message":
        if (!body.messageId) {
          return NextResponse.json(
            { success: false, data: null, error: "messageId required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          success: true,
          data: deleteOwnMessage(user, body.messageId),
          error: null,
        });
      case "react":
        if (!body.messageId || !body.emoji) {
          return NextResponse.json(
            { success: false, data: null, error: "messageId and emoji required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          success: true,
          data: reactToMessage(user, body.messageId, body.emoji),
          error: null,
        });
      case "pin":
        if (!body.messageId) {
          return NextResponse.json(
            { success: false, data: null, error: "messageId required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          success: true,
          data: pinMessage(user, body.messageId, body.pinned ?? true),
          error: null,
        });
      case "forward":
        if (!body.messageId || !body.peerUserId) {
          return NextResponse.json(
            { success: false, data: null, error: "messageId and peerUserId required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          success: true,
          data: await forwardMessage({
            user,
            messageId: body.messageId,
            peerUserId: body.peerUserId,
          }),
          error: null,
        });
      default:
        return NextResponse.json(
          { success: false, data: null, error: "action required" },
          { status: 400 },
        );
    }
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
