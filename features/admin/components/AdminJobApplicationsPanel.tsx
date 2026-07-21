"use client";

import { useEffect, useState } from "react";
import type { JobApplication } from "@/types/domain/job-application";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const statusLabel: Record<JobApplication["status"], string> = {
  submitted: "مقدّم",
  reviewed: "تمت المراجعة",
};

export function AdminJobApplicationsPanel() {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/job-applications", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setItems(data.applications ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function patchStatus(id: string, status: JobApplication["status"]) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/job-applications/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({
          status,
          actorId: user.id,
          actorName: user.fullName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.application) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.application : item)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات توظيف.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => (
            <li key={item.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{item.listingTitle}</p>
                <p className="admin-ops__queue-meta">
                  {item.applicantName} · {item.applicantEmail} · {item.phone}
                </p>
                <p className="admin-ops__queue-meta">
                  {item.currentCity} · خبرة {item.yearsOfExperience} سنة ·{" "}
                  {new Date(item.createdAt).toLocaleString("ar-AE")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`admin-ops__status-chip${
                    item.status === "reviewed" ? " admin-ops__status-chip--ok" : ""
                  }`}
                >
                  {statusLabel[item.status]}
                </span>
                {item.status === "submitted" ? (
                  <Button
                    loading={busyId === item.id}
                    onClick={() => patchStatus(item.id, "reviewed")}
                    size="sm"
                    type="button"
                  >
                    تعليم كمراجع
                  </Button>
                ) : (
                  <Button
                    loading={busyId === item.id}
                    onClick={() => patchStatus(item.id, "submitted")}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    إعادة لجديد
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
