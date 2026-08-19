"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import type { JobApplication } from "@/types/domain/job-application";

const labels: Record<JobApplication["status"], string> = {
  submitted: "مقدّم",
  reviewed: "تمت المراجعة",
  viewed: "تمت المشاهدة",
  shortlisted: "قائمة مختصرة",
  rejected: "مرفوض",
  accepted: "مقبول",
};

export function ApplicationsInbox() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("id");
  const [items, setItems] = useState<JobApplication[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) return;
    fetch(`/api/job-applications?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => setItems(data.applications ?? []))
      .catch(() => setItems([]));
  }, []);

  async function patch(id: string, status: JobApplication["status"]) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/job-applications/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.application) {
        setItems((prev) => prev.map((item) => (item.id === id ? data.application : item)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const user = getSessionUser();
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">لا توجد طلبات توظيف بعد.</p>
      </Card>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          className={`rounded-[var(--radius-xl)] border border-border p-4 ${
            highlight === item.id ? "ring-2 ring-secondary" : ""
          }`}
          key={item.id}
        >
          <p className="text-sm font-bold text-ink">{item.listingTitle}</p>
          <p className="mt-1 text-xs text-muted">
            {item.applicantName} · {item.applicantEmail} · {labels[item.status]}
          </p>
          {user?.id === item.employerId &&
          (item.status === "submitted" || item.status === "reviewed" || item.status === "viewed") ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "viewed")} size="sm" type="button" variant="ghost">
                تمت المشاهدة
              </Button>
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "shortlisted")} size="sm" type="button">
                قائمة مختصرة
              </Button>
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "accepted")} size="sm" type="button">
                قبول
              </Button>
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "rejected")} size="sm" type="button" variant="ghost">
                رفض
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
