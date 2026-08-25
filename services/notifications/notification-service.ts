/**
 * Centralized enterprise notification engine.
 * All modules must emit through emitNotification / notifyUsers — no ad-hoc duplicates.
 */

import { generateId } from "@/lib/security/crypto";
import type { NotificationRecord, PaginatedResponse } from "@/types";
import {
  resolveNotificationType,
  type NotificationCategory,
  type NotificationPriority,
} from "@/types/notifications";
import {
  defaultNotificationPreferences,
  findUserById,
  readAuthDb,
  writeAuthDb,
  type NotificationPreferences,
} from "@/services/auth/store";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { emailPaymentUpdate } from "@/services/email/automation-service";

const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

export function normalizeNotification(raw: NotificationRecord): NotificationRecord {
  const def = resolveNotificationType(raw.type);
  const status: NotificationRecord["status"] =
    raw.deletedAt || raw.status === "deleted"
      ? "deleted"
      : raw.archivedAt || raw.status === "archived"
        ? "archived"
        : raw.readAt || raw.status === "read"
          ? "read"
          : "unread";
  return {
    ...raw,
    channel: raw.channel ?? "in_app",
    category: raw.category ?? def.category,
    priority: raw.priority ?? def.priority,
    actionUrl:
      raw.actionUrl ?? (typeof raw.data?.actionUrl === "string" ? raw.data.actionUrl : null),
    status,
    groupKey: raw.groupKey ?? def.groupKey ?? null,
    dedupeKey: raw.dedupeKey ?? null,
    archivedAt: raw.archivedAt ?? null,
    deletedAt: raw.deletedAt ?? null,
    emailSentAt: raw.emailSentAt ?? null,
    data: raw.data ?? {},
  };
}

export function normalizePreferences(
  raw: Partial<NotificationPreferences> & { userId: string },
): NotificationPreferences {
  const base = defaultNotificationPreferences(raw.userId, Boolean(raw.emailMarketing));
  return {
    ...base,
    ...raw,
    emailEnabled: raw.emailEnabled ?? raw.emailTransactional ?? true,
    pushEnabled: raw.pushEnabled ?? false,
    marketingEnabled: raw.marketingEnabled ?? raw.emailMarketing ?? false,
    reminderEnabled: raw.reminderEnabled ?? true,
    securityEnabled: raw.securityEnabled ?? true,
    courseEnabled: raw.courseEnabled ?? true,
    bookingEnabled: raw.bookingEnabled ?? true,
    paymentEnabled: raw.paymentEnabled ?? true,
    messageEnabled: raw.messageEnabled ?? true,
    inAppEnabled: raw.inAppEnabled ?? true,
    emailTransactional: raw.emailTransactional ?? true,
    emailMarketing: raw.emailMarketing ?? false,
    emailProductUpdates: raw.emailProductUpdates ?? false,
  };
}

export function getNotificationPreferences(userId: string): NotificationPreferences {
  const row = readAuthDb().notificationPreferences.find((p) => p.userId === userId);
  if (row) return normalizePreferences(row);
  return defaultNotificationPreferences(userId, false);
}

export function updateNotificationPreferences(
  userId: string,
  patch: Partial<Omit<NotificationPreferences, "userId" | "createdAt">>,
): NotificationPreferences {
  let updated = defaultNotificationPreferences(userId, false);
  writeAuthDb((db) => {
    const idx = db.notificationPreferences.findIndex((p) => p.userId === userId);
    const current =
      idx >= 0
        ? normalizePreferences(db.notificationPreferences[idx]!)
        : defaultNotificationPreferences(userId, false);
    updated = normalizePreferences({
      ...current,
      ...patch,
      userId,
      updatedAt: nowIso(),
      createdAt: current.createdAt,
    });
    if (idx >= 0) db.notificationPreferences[idx] = updated;
    else db.notificationPreferences.push(updated);
  });
  return updated;
}

function categoryAllowed(prefs: NotificationPreferences, category: string): boolean {
  switch (category) {
    case "security":
      return prefs.securityEnabled;
    case "marketing":
      return prefs.marketingEnabled;
    case "reminder":
      return prefs.reminderEnabled;
    case "course":
    case "assignment":
      return prefs.courseEnabled;
    case "booking":
      return prefs.bookingEnabled;
    case "payment":
      return prefs.paymentEnabled;
    case "message":
      return prefs.messageEnabled;
    default:
      return true;
  }
}

function findRecentDedupe(
  userId: string,
  dedupeKey: string | null | undefined,
): NotificationRecord | null {
  if (!dedupeKey) return null;
  const cutoff = Date.now() - DEDUPE_WINDOW_MS;
  const rows = readAuthDb().notifications.filter(
    (n) =>
      n.userId === userId &&
      n.dedupeKey === dedupeKey &&
      !n.deletedAt &&
      Date.parse(n.createdAt) >= cutoff,
  );
  return rows[0] ? normalizeNotification(rows[0]) : null;
}

async function maybeSendEmail(input: {
  userId: string;
  title: string;
  body: string;
  type: string;
  emailDefault: boolean;
  forceEmail?: boolean;
  amountLabel?: string;
  reference?: string;
}): Promise<boolean> {
  const platform = getPlatformSettings();
  if (!platform.notifications.emailNotifications) return false;
  const prefs = getNotificationPreferences(input.userId);
  if (!prefs.emailEnabled && !prefs.emailTransactional) return false;
  const def = resolveNotificationType(input.type);
  if (def.category === "security" && !prefs.securityEnabled) return false;
  if (def.category === "marketing" && !prefs.marketingEnabled) return false;
  const should = input.forceEmail ?? input.emailDefault;
  if (!should) return false;
  try {
    await emailPaymentUpdate({
      userId: input.userId,
      title: input.title,
      detail: input.body,
      amountLabel: input.amountLabel,
      reference: input.reference ?? input.type,
    });
    return true;
  } catch {
    return false;
  }
}

export type EmitNotificationInput = {
  userId: string;
  type: string;
  title?: string;
  body?: string;
  channel?: NotificationRecord["channel"];
  data?: Record<string, unknown>;
  actionUrl?: string | null;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  groupKey?: string | null;
  dedupeKey?: string | null;
  /** Force or suppress email regardless of catalog default */
  email?: boolean;
  amountLabel?: string;
  reference?: string;
};

/**
 * Single entry point for creating notifications.
 * Respects platform + user preferences, dedupes, optional email.
 */
export async function emitNotification(
  input: EmitNotificationInput,
): Promise<NotificationRecord | null> {
  const def = resolveNotificationType(input.type);
  const platform = getPlatformSettings();
  const prefs = getNotificationPreferences(input.userId);

  if (!platform.notifications.inAppNotifications && input.email === undefined) {
    // Still allow critical security email path
  }
  if (!prefs.inAppEnabled && def.category !== "security") {
    if (input.email === false) return null;
  }
  if (!categoryAllowed(prefs, input.category ?? def.category) && def.category !== "security") {
    return null;
  }

  const existing = findRecentDedupe(input.userId, input.dedupeKey);
  if (existing) return existing;

  const title = input.title?.trim() || def.defaultTitle;
  const body = input.body?.trim() || def.defaultBody;
  const record: NotificationRecord = normalizeNotification({
    id: generateId(),
    userId: input.userId,
    title,
    body,
    channel: input.channel ?? "in_app",
    type: input.type,
    category: input.category ?? def.category,
    priority: input.priority ?? def.priority,
    actionUrl: input.actionUrl ?? null,
    status: "unread",
    data: input.data ?? {},
    groupKey: input.groupKey ?? def.groupKey ?? null,
    dedupeKey: input.dedupeKey ?? null,
    readAt: null,
    archivedAt: null,
    deletedAt: null,
    emailSentAt: null,
    createdAt: nowIso(),
  });

  if (prefs.inAppEnabled && platform.notifications.inAppNotifications) {
    writeAuthDb((db) => {
      db.notifications.unshift(record);
      // Cap per-user history
      const kept: NotificationRecord[] = [];
      const counts = new Map<string, number>();
      for (const n of db.notifications) {
        const c = counts.get(n.userId) ?? 0;
        if (c < 500) {
          kept.push(n);
          counts.set(n.userId, c + 1);
        }
      }
      db.notifications = kept;
    });
  }

  const emailed = await maybeSendEmail({
    userId: input.userId,
    title,
    body,
    type: input.type,
    emailDefault: def.emailDefault,
    forceEmail: input.email,
    amountLabel: input.amountLabel,
    reference: input.reference,
  });
  if (emailed) {
    writeAuthDb((db) => {
      const n = db.notifications.find((x) => x.id === record.id);
      if (n) n.emailSentAt = nowIso();
    });
    record.emailSentAt = nowIso();
  }

  return record;
}

/** @deprecated Prefer emitNotification — kept for backward compatibility */
export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  channel?: "in_app" | "email";
  type?: string;
  data?: Record<string, unknown>;
}): Promise<NotificationRecord> {
  const created = await emitNotification({
    userId: input.userId,
    title: input.title,
    body: input.body,
    channel: input.channel === "email" ? "in_app" : (input.channel ?? "in_app"),
    type: input.type ?? "system",
    data: input.data,
    email: input.channel === "email" ? true : undefined,
  });
  return (
    created ??
    normalizeNotification({
      id: generateId(),
      userId: input.userId,
      title: input.title,
      body: input.body,
      channel: "in_app",
      type: input.type ?? "system",
      data: input.data ?? {},
      readAt: null,
      createdAt: nowIso(),
    })
  );
}

export type ListNotificationOptions = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  status?: "unread" | "read" | "archived" | "all" | "active";
  type?: string;
  category?: string;
  priority?: string;
  q?: string;
  from?: string;
  to?: string;
  grouped?: boolean;
};

export type GroupedNotificationItem = {
  kind: "group" | "single";
  groupKey: string | null;
  count: number;
  title: string;
  body: string;
  latest: NotificationRecord;
  items: NotificationRecord[];
};

function matchesFilters(n: NotificationRecord, options?: ListNotificationOptions): boolean {
  const norm = normalizeNotification(n);
  if (norm.deletedAt || norm.status === "deleted") return false;
  if (options?.status === "archived") {
    if (norm.status !== "archived") return false;
  } else if (options?.status === "unread") {
    if (norm.status !== "unread") return false;
  } else if (options?.status === "read") {
    if (norm.status !== "read") return false;
  } else if (options?.status === "active" || !options?.status || options.status === "all") {
    if (options?.status === "active" && norm.status === "archived") return false;
    if (!options?.status && norm.status === "archived") return false;
  }
  if (options?.unreadOnly && norm.readAt) return false;
  if (options?.type && norm.type !== options.type && !norm.type.startsWith(options.type)) {
    return false;
  }
  if (options?.category && norm.category !== options.category) return false;
  if (options?.priority && norm.priority !== options.priority) return false;
  if (options?.from && norm.createdAt < options.from) return false;
  if (options?.to && norm.createdAt > options.to) return false;
  if (options?.q) {
    const q = options.q.toLowerCase();
    if (
      !norm.title.toLowerCase().includes(q) &&
      !norm.body.toLowerCase().includes(q) &&
      !norm.type.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
}

export function groupNotifications(rows: NotificationRecord[]): GroupedNotificationItem[] {
  const groups = new Map<string, NotificationRecord[]>();
  const singles: NotificationRecord[] = [];
  for (const raw of rows) {
    const n = normalizeNotification(raw);
    const key = n.groupKey;
    if (key && (n.status === "unread" || !n.readAt)) {
      const list = groups.get(key) ?? [];
      list.push(n);
      groups.set(key, list);
    } else {
      singles.push(n);
    }
  }

  const out: GroupedNotificationItem[] = [];
  for (const [key, items] of groups) {
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const latest = items[0]!;
    if (items.length === 1) {
      out.push({
        kind: "single",
        groupKey: key,
        count: 1,
        title: latest.title,
        body: latest.body,
        latest,
        items,
      });
    } else {
      const label = key.split(".").pop()?.replaceAll("_", " ") ?? "notifications";
      out.push({
        kind: "group",
        groupKey: key,
        count: items.length,
        title: `You have ${items.length} new ${label}`,
        body: latest.body,
        latest,
        items,
      });
    }
  }
  for (const n of singles) {
    out.push({
      kind: "single",
      groupKey: n.groupKey ?? null,
      count: 1,
      title: n.title,
      body: n.body,
      latest: n,
      items: [n],
    });
  }
  out.sort((a, b) => b.latest.createdAt.localeCompare(a.latest.createdAt));
  return out;
}

export function listNotifications(
  userId: string,
  options?: ListNotificationOptions,
): PaginatedResponse<NotificationRecord> & {
  unreadCount: number;
  groups?: GroupedNotificationItem[];
} {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const db = readAuthDb();
  const rows = db.notifications
    .filter((n) => n.userId === userId)
    .map(normalizeNotification)
    .filter((n) => matchesFilters(n, options));

  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const unreadCount = db.notifications.filter(
    (n) => n.userId === userId && !n.readAt && !n.deletedAt && !n.archivedAt,
  ).length;

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  const result: PaginatedResponse<NotificationRecord> & {
    unreadCount: number;
    groups?: GroupedNotificationItem[];
  } = {
    data: pageRows,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    unreadCount,
  };

  if (options?.grouped) {
    result.groups = groupNotifications(pageRows);
  }

  return result;
}

export function markNotificationRead(
  userId: string,
  notificationId: string,
): NotificationRecord | null {
  let updated: NotificationRecord | null = null;
  writeAuthDb((db) => {
    const n = db.notifications.find((x) => x.id === notificationId && x.userId === userId);
    if (n && !n.deletedAt) {
      if (!n.readAt) n.readAt = nowIso();
      n.status = n.archivedAt ? "archived" : "read";
      updated = normalizeNotification(n);
    }
  });
  return updated;
}

export function markAllNotificationsRead(userId: string): number {
  let count = 0;
  writeAuthDb((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === userId && !n.readAt && !n.deletedAt && !n.archivedAt) {
        n.readAt = nowIso();
        n.status = "read";
        count += 1;
      }
    });
  });
  return count;
}

export function archiveNotification(
  userId: string,
  notificationId: string,
): NotificationRecord | null {
  let updated: NotificationRecord | null = null;
  writeAuthDb((db) => {
    const n = db.notifications.find((x) => x.id === notificationId && x.userId === userId);
    if (n && !n.deletedAt) {
      n.archivedAt = nowIso();
      n.status = "archived";
      if (!n.readAt) n.readAt = n.archivedAt;
      updated = normalizeNotification(n);
    }
  });
  return updated;
}

export function deleteNotification(
  userId: string,
  notificationId: string,
): NotificationRecord | null {
  let updated: NotificationRecord | null = null;
  writeAuthDb((db) => {
    const n = db.notifications.find((x) => x.id === notificationId && x.userId === userId);
    if (n) {
      n.deletedAt = nowIso();
      n.status = "deleted";
      if (!n.readAt) n.readAt = n.deletedAt;
      updated = normalizeNotification(n);
    }
  });
  return updated;
}

export function getUnreadCount(userId: string): number {
  return readAuthDb().notifications.filter(
    (n) => n.userId === userId && !n.readAt && !n.deletedAt && !n.archivedAt,
  ).length;
}

/** Fan-out helper used by domain modules */
export async function notifyUsers(
  userIds: string[],
  input: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
    actionUrl?: string | null;
    dedupeKey?: string | null;
    email?: boolean;
  },
) {
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(
    unique.map((userId) =>
      emitNotification({
        userId,
        title: input.title,
        body: input.body,
        type: input.type,
        data: input.data,
        actionUrl: input.actionUrl,
        dedupeKey: input.dedupeKey ? `${input.dedupeKey}:${userId}` : null,
        email: input.email,
      }),
    ),
  );
}

/** Notify all users with a given role (admin ops) */
export async function notifyRole(
  role: string,
  input: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
    actionUrl?: string | null;
  },
) {
  const users = readAuthDb().users.filter((u) => u.role === role && u.status === "active");
  await notifyUsers(
    users.map((u) => u.id),
    input,
  );
}

export function assertUserExists(userId: string): boolean {
  return Boolean(findUserById(userId));
}
