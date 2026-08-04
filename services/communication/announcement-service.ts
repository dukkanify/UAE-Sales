/**
 * Platform / course / targeted announcements.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import {
  assertCanManageAnnouncements,
  CommunicationError,
} from "@/services/communication/access";
import { moderateText } from "@/services/communication/moderation-service";
import { notifyUsers } from "@/services/communication/notify";
import {
  readCommunicationDb,
  writeCommunicationDb,
} from "@/services/communication/store";
import type { Announcement, AnnouncementTarget } from "@/types/communication";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

export function listAnnouncements(filters?: {
  status?: Announcement["status"] | "all";
  forUser?: UserProfile;
}): Announcement[] {
  const now = nowIso();
  writeCommunicationDb((db) => {
    for (const a of db.announcements) {
      if (a.status === "scheduled" && a.scheduledAt && a.scheduledAt <= now) {
        a.status = "published";
        a.publishedAt = a.publishedAt ?? now;
      }
    }
  });

  let rows = [...readCommunicationDb().announcements];
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((a) => a.status === filters.status);
  }
  if (filters?.forUser) {
    const user = filters.forUser;
    rows = rows.filter((a) => {
      if (a.status !== "published") return false;
      if (a.target === "platform") return true;
      if (a.target === "student" && a.targetId === user.id) return true;
      if (a.target === "instructor" && a.targetId === user.id) return true;
      if (a.target === "course") return true; // enrollment filtering soft — show course announcements
      if (a.target === "group") return true;
      return user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
    });
  }
  return rows.sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt),
  );
}

export async function publishAnnouncement(input: {
  user: UserProfile;
  title: string;
  bodyHtml: string;
  target: AnnouncementTarget;
  targetId?: string | null;
  scheduledAt?: string | null;
  status?: Announcement["status"];
}): Promise<Announcement> {
  assertCanManageAnnouncements(input.user);
  if (input.user.role === "instructor" && input.target === "platform") {
    throw new CommunicationError("Instructors cannot publish platform-wide announcements", 403);
  }

  const id = generateId();
  const moderation = moderateText(input.bodyHtml.replace(/<[^>]+>/g, " "), {
    contentType: "announcement",
    contentId: id,
    actorId: input.user.id,
  });
  if (!moderation.allowed) {
    throw new CommunicationError("Announcement blocked by moderation", 422);
  }

  const stamp = nowIso();
  const status =
    input.status ??
    (input.scheduledAt && input.scheduledAt > stamp ? "scheduled" : "published");

  const announcement: Announcement = {
    id,
    title: input.title.trim(),
    bodyHtml: input.bodyHtml,
    target: input.target,
    targetId: input.targetId ?? null,
    authorId: input.user.id,
    authorName: input.user.fullName || input.user.email,
    scheduledAt: input.scheduledAt ?? null,
    publishedAt: status === "published" ? stamp : null,
    status,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.announcements.unshift(announcement);
  });

  if (status === "published") {
    const recipients = resolveRecipients(announcement);
    await notifyUsers(recipients, {
      title: "Announcement",
      body: announcement.title,
      type: "announcement.published",
      data: { announcementId: announcement.id },
    });
  }

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ANNOUNCEMENT_PUBLISHED,
    entityType: "announcement",
    entityId: announcement.id,
    metadata: { target: announcement.target, status },
  });

  return announcement;
}

function resolveRecipients(a: Announcement): string[] {
  const users = readAuthDb().users.filter((u) => u.status === "active");
  if (a.target === "platform") return users.map((u) => u.id);
  if ((a.target === "student" || a.target === "instructor") && a.targetId) {
    return [a.targetId];
  }
  // course / group — notify students + instructors broadly for demo
  return users
    .filter((u) => u.role === ROLES.STUDENT || u.role === ROLES.INSTRUCTOR)
    .map((u) => u.id);
}
