import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type AdminAuditEntry = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  detail?: string;
  createdAt: string;
};

const FILE = "admin-audit.json";

export async function logAdminAction(
  input: Omit<AdminAuditEntry, "id" | "createdAt">,
): Promise<AdminAuditEntry> {
  const rows = await loadCollection<AdminAuditEntry>(FILE).catch(
    () => [] as AdminAuditEntry[],
  );
  const entry: AdminAuditEntry = {
    ...input,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  rows.unshift(entry);
  await saveCollection(FILE, rows.slice(0, 300));
  return entry;
}

export async function getAdminAuditLog(limit = 50): Promise<AdminAuditEntry[]> {
  const rows = await loadCollection<AdminAuditEntry>(FILE).catch(
    () => [] as AdminAuditEntry[],
  );
  return rows.slice(0, limit);
}
