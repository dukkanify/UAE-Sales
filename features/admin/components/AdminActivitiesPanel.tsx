"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/features/admin/lib/admin-fetch";
import type { ActivityKind, ActivityRecord } from "@/types/domain/activity";
import { activityKindLabel } from "@/services/activity/activity-labels";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";

export function AdminActivitiesPanel() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ActivityRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [kind, setKind] = useState(searchParams.get("kind") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (kind) params.set("kind", kind);
      if (status.trim()) params.set("status", status.trim());
      params.set("page", String(page));
      params.set("pageSize", "25");
      const response = await adminFetch(`/api/admin/activities?${params.toString()}`);
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } finally {
      setLoading(false);
    }
  }, [kind, page, query, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  return (
    <div className="grid gap-4">
      <Card className="p-4" variant="flat">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label="بحث"
            name="query"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
          <Select
            label="النوع"
            name="kind"
            onChange={(event) => {
              setKind(event.target.value);
              setPage(1);
            }}
            options={[
              { label: "الكل", value: "" },
              ...(
                [
                  "job_application",
                  "viewing_booking",
                  "quote_request",
                  "service_booking",
                  "order",
                  "listing",
                  "dispute",
                ] as ActivityKind[]
              ).map((value) => ({ label: activityKindLabel(value), value })),
            ]}
            value={kind}
          />
          <Input
            label="الحالة"
            name="status"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          />
          <div className="flex items-end">
            <Button onClick={() => void load()} type="button" variant="accent">
              تطبيق
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">جاري التحميل...</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد أنشطة مطابقة.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{item.title}</p>
                <p className="admin-ops__queue-meta">
                  {activityKindLabel(item.kind)} · {item.statusLabel} ·{" "}
                  {new Date(item.updatedAt).toLocaleString("ar-AE")}
                </p>
                {item.subtitle ? (
                  <p className="admin-ops__queue-meta">{item.subtitle}</p>
                ) : null}
              </div>
              <Link className="text-xs font-semibold text-primary hover:underline" href={item.href}>
                فتح
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {total.toLocaleString("ar-AE")} نشاط
        </span>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} size="sm" type="button" variant="secondary">
            السابق
          </Button>
          <Button
            disabled={page * 25 >= total}
            onClick={() => setPage((p) => p + 1)}
            size="sm"
            type="button"
            variant="secondary"
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
