"use client";

import { useEffect, useState } from "react";
import type { AppNotification } from "@/types/domain/notification";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

export function AdminNotificationsPanel() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [summary, setSummary] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/notifications", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.notifications ?? []);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4">
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">كل الإشعارات</p>
          <p className="admin-ops__kpi-value">{summary.total}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">غير مقروء</p>
          <p className="admin-ops__kpi-value">{summary.unread}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد إشعارات في النظام بعد.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => (
            <li key={item.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{item.title}</p>
                <p className="admin-ops__queue-meta">
                  {item.body} · {item.userId} · {item.type}
                </p>
                <p className="admin-ops__queue-meta">
                  {new Date(item.createdAt).toLocaleString("ar-AE")}
                </p>
              </div>
              <span
                className={`admin-ops__status-chip${
                  item.read ? "" : " admin-ops__status-chip--warn"
                }`}
              >
                {item.read ? "مقروء" : "جديد"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
