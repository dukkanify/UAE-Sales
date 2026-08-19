"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useState } from "react";
import type { AppNotification } from "@/types/domain/notification";
import type { EmailLogRecord } from "@/services/email/email-log-store";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

const emailStatusLabel: Record<EmailLogRecord["status"], string> = {
  pending: "قيد الإرسال",
  sent: "أُرسل",
  failed: "فشل",
  skipped: "مكرر",
};

export function AdminNotificationsPanel() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState({
    total: 0,
    unread: 0,
    emailsSent: 0,
    emailsFailed: 0,
    emailsPending: 0,
  });

  function load() {
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
  }

  useEffect(() => {
    load();
  }, []);

  async function runAction(
    action: "retry" | "retry_all" | "test",
    id?: string,
  ) {
    setBusy(true);
    setMessage("");
    try {
      const response = await adminFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action, id }),
      });
      const data = await response.json();
      if (data.status === "sent") {
        setMessage("تم إرسال البريد.");
      } else if (data.sent != null) {
        setMessage(`أُعيد الإرسال: ${data.sent} نجح، ${data.failed} فشل.`);
      } else if (data.skipped) {
        setMessage("تم التخطي لتجنب التكرار.");
      } else {
        setMessage("لم يصل البريد. تحقق من Resend والمجال.");
      }
      load();
    } catch {
      setMessage("تعذر تنفيذ العملية.");
    } finally {
      setBusy(false);
    }
  }

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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          onClick={() => void runAction("test")}
        >
          إرسال بريد تجريبي
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => void runAction("retry_all")}
        >
          إعادة إرسال الفاشل
        </Button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
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
              <div className="flex items-center gap-2">
                {(item.status === "failed" || item.status === "pending") && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void runAction("retry", item.id)}
                  >
                    إعادة
                  </Button>
                )}
                <span
                  className={`admin-ops__status-chip${
                    item.status === "failed" ? " admin-ops__status-chip--warn" : ""
                  }`}
                >
                  {emailStatusLabel[item.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
