/**
 * Support ticket system with SLA-ish response tracking.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import {
  assertCanManageSupport,
  assertCanOwnSupport,
  canManageSupport,
  CommunicationError,
} from "@/services/communication/access";
import { moderateText } from "@/services/communication/moderation-service";
import { notifyUsers } from "@/services/communication/notify";
import { readCommunicationDb, writeCommunicationDb } from "@/services/communication/store";
import type {
  AttachmentRef,
  SupportTicket,
  TicketReply,
  TicketStatus,
  TicketType,
} from "@/types/communication";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function nextTicketNumber(): string {
  const n = readCommunicationDb().tickets.length + 1;
  return `SUP-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

export function listTickets(user: UserProfile, filters?: { status?: TicketStatus | "all" }) {
  assertCanOwnSupport(user);
  let rows = [...readCommunicationDb().tickets];
  if (!canManageSupport(user)) {
    rows = rows.filter((t) => t.requesterId === user.id);
  }
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((t) => t.status === filters.status);
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTicket(id: string): SupportTicket | null {
  return readCommunicationDb().tickets.find((t) => t.id === id) ?? null;
}

export function assertTicketAccess(user: UserProfile, ticketId: string): SupportTicket {
  const ticket = getTicket(ticketId);
  if (!ticket) throw new CommunicationError("Ticket not found", 404);
  if (canManageSupport(user) || ticket.requesterId === user.id) return ticket;
  throw new CommunicationError("Access denied", 403);
}

export async function createTicket(input: {
  user: UserProfile;
  type: TicketType;
  subject: string;
  description: string;
  attachments?: AttachmentRef[];
}): Promise<SupportTicket> {
  assertCanOwnSupport(input.user);
  const id = generateId();
  const moderation = moderateText(input.description, {
    contentType: "ticket",
    contentId: id,
    actorId: input.user.id,
  });
  if (!moderation.allowed) {
    throw new CommunicationError("Ticket content blocked by moderation", 422);
  }

  const stamp = nowIso();
  const ticket: SupportTicket = {
    id,
    ticketNumber: nextTicketNumber(),
    type: input.type,
    subject: input.subject.trim(),
    description: moderation.redactedBody ?? input.description.trim(),
    status: "open",
    requesterId: input.user.id,
    requesterName: input.user.fullName || input.user.email,
    requesterRole: input.user.role,
    assigneeId: null,
    assigneeName: null,
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    attachments: input.attachments ?? [],
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.tickets.unshift(ticket);
  });

  const admins = readAuthDb().users.filter(
    (u) => u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN,
  );
  await notifyUsers(
    admins.map((a) => a.id),
    {
      title: "New support ticket",
      body: `${ticket.ticketNumber}: ${ticket.subject}`,
      type: "ticket.created",
      data: { ticketId: ticket.id },
    },
  );

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.SUPPORT_TICKET_CREATED,
    entityType: "support_ticket",
    entityId: ticket.id,
  });

  return ticket;
}

export async function updateTicket(input: {
  user: UserProfile;
  ticketId: string;
  status?: TicketStatus;
  assigneeId?: string | null;
}): Promise<SupportTicket> {
  assertCanManageSupport(input.user);
  const stamp = nowIso();
  let updatedId: string | null = null;

  writeCommunicationDb((db) => {
    const t = db.tickets.find((x) => x.id === input.ticketId);
    if (!t) return;
    if (input.status) {
      t.status = input.status;
      if (input.status === "resolved") t.resolvedAt = stamp;
      if (input.status === "closed") t.closedAt = stamp;
    }
    if (input.assigneeId !== undefined) {
      t.assigneeId = input.assigneeId;
      if (input.assigneeId) {
        const u = readAuthDb().users.find((x) => x.id === input.assigneeId);
        t.assigneeName = u ? toUserProfile(u).fullName || u.email : null;
      } else {
        t.assigneeName = null;
      }
    }
    t.updatedAt = stamp;
    updatedId = t.id;
  });

  const updated = updatedId ? getTicket(updatedId) : null;
  if (!updated) throw new CommunicationError("Ticket not found", 404);

  await notifyUsers([updated.requesterId], {
    title: "Support ticket updated",
    body: `${updated.ticketNumber} is now ${updated.status.replace(/_/g, " ")}`,
    type: "ticket.updated",
    data: { ticketId: updated.id, status: updated.status },
    actionUrl: `/support?ticket=${updated.id}`,
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.SUPPORT_TICKET_UPDATED,
    entityType: "support_ticket",
    entityId: updated.id,
    metadata: { status: updated.status, assigneeId: updated.assigneeId },
  });

  return updated;
}

export async function replyToTicket(input: {
  user: UserProfile;
  ticketId: string;
  body: string;
  attachments?: AttachmentRef[];
  /** Staff-only note — never notified to the requester */
  isInternal?: boolean;
}): Promise<TicketReply> {
  const ticket = assertTicketAccess(input.user, input.ticketId);
  const id = generateId();
  const isStaff = canManageSupport(input.user);
  const isInternal = Boolean(input.isInternal) && isStaff;

  const moderation = moderateText(input.body, {
    contentType: "ticket",
    contentId: id,
    actorId: input.user.id,
  });
  if (!moderation.allowed) {
    throw new CommunicationError("Reply blocked by moderation", 422);
  }

  const stamp = nowIso();
  const reply: TicketReply = {
    id,
    ticketId: ticket.id,
    authorId: input.user.id,
    authorName: input.user.fullName || input.user.email,
    body: moderation.redactedBody ?? input.body.trim(),
    isStaff,
    isInternal,
    attachments: input.attachments ?? [],
    createdAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.ticketReplies.push(reply);
    const t = db.tickets.find((x) => x.id === ticket.id);
    if (t) {
      t.updatedAt = stamp;
      if (isStaff && !isInternal && !t.firstResponseAt) t.firstResponseAt = stamp;
      if (isStaff && !isInternal && t.status === "open") t.status = "in_progress";
      if (!isStaff && t.status === "waiting_customer") t.status = "in_progress";
    }
  });

  if (!isInternal) {
    const notifyId = isStaff ? ticket.requesterId : ticket.assigneeId;
    if (notifyId) {
      await notifyUsers([notifyId], {
        title: "Ticket reply",
        body: `${ticket.ticketNumber}: ${reply.body.slice(0, 80)}`,
        type: "ticket.reply",
        data: { ticketId: ticket.id, replyId: reply.id },
        actionUrl: `/support?ticket=${ticket.id}`,
      });
    }
  }

  return reply;
}

export function listTicketReplies(user: UserProfile, ticketId: string): TicketReply[] {
  assertTicketAccess(user, ticketId);
  const canSeeInternal = canManageSupport(user);
  return readCommunicationDb()
    .ticketReplies.filter((r) => r.ticketId === ticketId && (canSeeInternal || !r.isInternal))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ticketStats() {
  const tickets = readCommunicationDb().tickets;
  const withResponse = tickets.filter((t) => t.firstResponseAt);
  const avgFirstResponseMinutes =
    withResponse.length === 0
      ? 0
      : Math.round(
          withResponse.reduce((sum, t) => {
            const ms = new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime();
            return sum + ms / 60000;
          }, 0) / withResponse.length,
        );

  return {
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    waiting: tickets.filter((t) => t.status === "waiting_customer").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    avgFirstResponseMinutes,
    total: tickets.length,
  };
}
