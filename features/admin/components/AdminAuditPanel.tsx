"use client";

import { useEffect, useState } from "react";
import type { AdminAuditEntry } from "@/services/admin/admin-audit-store";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

export function AdminAuditPanel() {
  const [entries, setEntries] = useState<AdminAuditEntry[]>([]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/audit", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]));
  }, []);

  return (
    <div className="grid gap-4">
      {entries.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">
            لا توجد عمليات مسجّلة بعد. ستظهر هنا إجراءات التحرير والاسترداد وتحديث الحالات.
          </p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {entries.map((entry) => (
            <li key={entry.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">
                  {entry.action} · {entry.targetType}/{entry.targetId}
                </p>
                <p className="admin-ops__queue-meta">
                  {entry.actorName} ·{" "}
                  {new Date(entry.createdAt).toLocaleString("ar-AE")}
                </p>
                {entry.detail ? (
                  <p className="admin-ops__queue-meta">{entry.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
