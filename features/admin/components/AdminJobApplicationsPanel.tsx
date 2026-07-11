"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

type JobApplication = {
  id: string;
  listingTitle: string;
  applicantName: string;
  createdAt: string;
};

export function AdminJobApplicationsPanel() {
  const [items, setItems] = useState<JobApplication[]>([]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/job-applications", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setItems(data.applications ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات توظيف.</p>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="p-4" variant="flat">
            <p className="font-semibold text-ink">{item.listingTitle}</p>
            <p className="mt-1 text-sm text-muted">{item.applicantName}</p>
            <p className="mt-1 text-xs text-muted">
              {new Date(item.createdAt).toLocaleString("ar-AE")}
            </p>
          </Card>
        ))
      )}
      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
