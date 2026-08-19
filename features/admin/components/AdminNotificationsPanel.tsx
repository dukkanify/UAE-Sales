"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useState } from "react";
import type { AppNotification } from "@/types/domain/notification";
import type { EmailLogRecord } from "@/services/email/email-log-store";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

const emailStatusLabel: Record<EmailLogRecord["status"], string> = {
  pending: "قيد الإرسال",
  sent: "أُرسل",
  failed: "فشل",
  skipped: "مكرر",
};

export function AdminNotificationsPanel() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    unread: 0,
    emailsSent: 0,
    emailsFailed: 0,
    emailsPending: 0,
  });

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/notifications")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.notifications ?? []);
        setEmailLogs(data.emailLogs ?? []);
        if (data.summary) {
          setSummary({
            total: data.summary.total ?? 0,
            unread: data.summary.unread ?? 0,
            emailsSent: data.summary.emailsSent ?? 0,
            emailsFailed: data.summary.emailsFailed ?? 0,
            emailsPending: data.summary.emailsPending ?? 0,
          });
        }
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
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">بريد أُرسل</p>
          <p className="admin-ops__kpi-value">{summary.emailsSent}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">بريد فشل</p>
          <p className="admin-ops__kpi-value">{summary.emailsFailed}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">بريد قيد الإرسال</p>
          <p className="admin-ops__kpi-value">{summary.emailsPending}</p>
        </div>
      </div>

      <h2 className="text-base font-black text-ink">الإشعارات الداخلية</h2>
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

      <h2 className="mt-4 text-base font-black text-ink">سجل البريد الإلكتروني</h2>
      {emailLogs.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لم يُسجَّل إرسال بريد بعد.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {emailLogs.map((item) => (
            <li key={item.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{item.subject}</p>
                <p className="admin-ops__queue-meta">
                  {item.to} · {item.type} · {item.entityId}
                </p>
                <p className="admin-ops__queue-meta">
                  {new Date(item.createdAt).toLocaleString("ar-AE")}
                  {item.error ? ` · ${item.error}` : ""}
                </p>
              </div>
              <span
                className={`admin-ops__status-chip${
                  item.status === "failed" ? " admin-ops__status-chip--warn" : ""
                }`}
              >
                {emailStatusLabel[item.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
