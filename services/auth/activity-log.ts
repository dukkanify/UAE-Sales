import { generateId } from "@/lib/security/crypto";
import type { ActivityLogRecord, AuditLogRecord } from "@/types";
import type { ActivityAction } from "@/constants/activity-actions";
import { writeAuthDb, readAuthDb } from "@/services/auth/store";

export async function logActivity(input: {
  actorId: string | null;
  action: ActivityAction | string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<ActivityLogRecord> {
  const record: ActivityLogRecord = {
    id: generateId(),
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: new Date().toISOString(),
  };

  writeAuthDb((db) => {
    db.activityLogs.unshift(record);
    if (db.activityLogs.length > 5000) {
      db.activityLogs = db.activityLogs.slice(0, 5000);
    }
  });

  return record;
}

export async function logAudit(input: {
  actorId: string | null;
  action: string;
  resource: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<AuditLogRecord> {
  const record: AuditLogRecord = {
    id: generateId(),
    actorId: input.actorId,
    action: input.action,
    resource: input.resource,
    beforeState: input.beforeState ?? null,
    afterState: input.afterState ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: new Date().toISOString(),
  };

  writeAuthDb((db) => {
    db.auditLogs.unshift(record);
    if (db.auditLogs.length > 5000) {
      db.auditLogs = db.auditLogs.slice(0, 5000);
    }
  });

  return record;
}

export function listActivityLogs(options?: {
  page?: number;
  pageSize?: number;
  action?: string;
}): {
  data: ActivityLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 25;
  const db = readAuthDb();
  let rows = db.activityLogs;
  if (options?.action) {
    rows = rows.filter((r) => r.action === options.action);
  }
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
