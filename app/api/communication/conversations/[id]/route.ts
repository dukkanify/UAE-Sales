import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  assertParticipant,
  listMessages,
  listTyping,
  markConversationRead,
  sendMessage,
  setConversationFlags,
  setTyping,
} from "@/services/communication/messaging-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.MESSAGING_OWN);
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const conv = assertParticipant(user, id);
    const messages = listMessages(user, id, {
      q: searchParams.get("q") ?? undefined,
      before: searchParams.get("before") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 50),
    });
    const typing = listTyping(id, user.id);
    return NextResponse.json({
      success: true,
      data: { conversation: conv, messages, typing },
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
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      action?: "send" | "read" | "typing" | "mute" | "archive" | "delete";
      body?: string;
      attachments?: [];
      muted?: boolean;
      archived?: boolean;
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
