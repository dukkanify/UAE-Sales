"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useState } from "react";
import type { JobApplication } from "@/types/domain/job-application";
import { jobStatusLabel } from "@/services/activity/activity-labels";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

const ADMIN_ACTIONS: Partial<
  Record<JobApplication["status"], { value: JobApplication["status"]; label: string }[]>
> = {
  submitted: [
    { value: "viewed", label: "تمت المشاهدة" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "accepted", label: "مقبول" },
    { value: "rejected", label: "مرفوض" },
  ],
  viewed: [
    { value: "shortlisted", label: "Shortlisted" },
    { value: "accepted", label: "مقبول" },
    { value: "rejected", label: "مرفوض" },
  ],
  reviewed: [
    { value: "shortlisted", label: "Shortlisted" },
    { value: "accepted", label: "مقبول" },
    { value: "rejected", label: "مرفوض" },
  ],
  shortlisted: [
    { value: "accepted", label: "مقبول" },
    { value: "rejected", label: "مرفوض" },
  ],
};

function statusChipClass(status: JobApplication["status"]): string {
  if (status === "accepted" || status === "shortlisted") {
    return " admin-ops__status-chip--ok";
  }
  if (status === "rejected") {
    return " admin-ops__status-chip--warn";
  }
  return "";
}

export function AdminJobApplicationsPanel() {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/job-applications")
      .then((res) => res.json())
      .then((data) => setItems(data.applications ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function patchStatus(id: string, status: JobApplication["status"]) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await adminFetch(`/api/admin/job-applications/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
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
    <LocalizedTree>
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات توظيف.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => {
            const actions = ADMIN_ACTIONS[item.status] ?? [];
            return (
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
                    className={`admin-ops__status-chip${statusChipClass(item.status)}`}
                  >
                    {jobStatusLabel(item.status)}
                  </span>
                  {actions.map((action) => (
                    <Button
                      key={action.value}
                      loading={busyId === item.id}
                      onClick={() => patchStatus(item.id, action.value)}
                      size="sm"
                      type="button"
                      variant={action.value === "rejected" ? "ghost" : "secondary"}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </LocalizedTree>
  );
}
