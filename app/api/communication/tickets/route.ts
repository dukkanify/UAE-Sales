import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  createTicket,
  listTicketReplies,
  listTickets,
  replyToTicket,
  ticketStats,
  updateTicket,
} from "@/services/communication/support-service";
import { canManageSupport } from "@/services/communication/access";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { TicketStatus, TicketType } from "@/types/communication";

export async function GET(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.SUPPORT_OWN);
    const { searchParams } = new URL(request.url);
    if (searchParams.get("stats") === "1" && canManageSupport(user)) {
      return NextResponse.json({ success: true, data: ticketStats(), error: null });
    }
    if (searchParams.get("id")) {
      const id = searchParams.get("id")!;
      const tickets = listTickets(user);
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        data: { ticket, replies: listTicketReplies(user, id) },
        error: null,
      });
    }
    const status = (searchParams.get("status") as TicketStatus | "all" | null) ?? "all";
    return NextResponse.json({
      success: true,
      data: listTickets(user, { status }),
      error: null,
    });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.SUPPORT_OWN);
    const body = (await request.json().catch(() => null)) as {
      action?: "create" | "reply" | "update";
      type?: TicketType;
      subject?: string;
      description?: string;
      ticketId?: string;
      body?: string;
      status?: TicketStatus;
      assigneeId?: string | null;
      isInternal?: boolean;
    } | null;

    if (body?.action === "reply" && body.ticketId) {
      const reply = await replyToTicket({
        user,
        ticketId: body.ticketId,
        body: body.body ?? "",
        isInternal: body.isInternal,
      });
      return NextResponse.json({ success: true, data: reply, error: null });
    }

    if (body?.action === "update" && body.ticketId) {
      await requirePermission(PERMISSIONS.SUPPORT_MANAGE);
      const ticket = await updateTicket({
        user,
        ticketId: body.ticketId,
        status: body.status,
        assigneeId: body.assigneeId,
      });
      return NextResponse.json({ success: true, data: ticket, error: null });
    }

    const ticket = await createTicket({
      user,
      type: body?.type ?? "general",
      subject: body?.subject ?? "Support request",
      description: body?.description ?? "",
    });
    return NextResponse.json({ success: true, data: ticket, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
