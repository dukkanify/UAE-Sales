"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ActivityKind, ActivityRecord, ActivityScope, ActivitySummary } from "@/types/domain/activity";
import { activityKindLabel } from "@/services/activity/activity-labels";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { useToast } from "@/shared/components/ToastProvider";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Icon } from "@/shared/ui/Icon";

type ActivityFeedProps = {
  initialScope?: ActivityScope | "all";
  compact?: boolean;
  showScopeTabs?: boolean;
  manageReceived?: boolean;
};

const RECEIVED_KINDS = new Set<ActivityKind>([
  "job_application",
  "viewing_booking",
  "quote_request",
  "service_booking",
]);

const STATUS_OPTIONS: Partial<Record<ActivityKind, { value: string; label: string }[]>> = {
  job_application: [
    { value: "viewed", label: "تمت المشاهدة" },
    { value: "shortlisted", label: "قائمة مختصرة" },
    { value: "accepted", label: "مقبول" },
    { value: "rejected", label: "مرفوض" },
  ],
  viewing_booking: [
    { value: "confirmed", label: "تأكيد" },
    { value: "cancelled", label: "إلغاء" },
    { value: "completed", label: "إكمال" },
  ],
  quote_request: [
    { value: "quoted", label: "إرسال عرض" },
    { value: "accepted", label: "قبول" },
    { value: "rejected", label: "رفض" },
    { value: "completed", label: "إكمال" },
  ],
  service_booking: [
    { value: "quoted", label: "إرسال عرض" },
    { value: "accepted", label: "قبول" },
    { value: "rejected", label: "رفض" },
    { value: "completed", label: "إكمال" },
  ],
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ar-AE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ActivityFeed({
  compact = false,
  initialScope = "all",
  manageReceived = true,
  showScopeTabs = true,
}: ActivityFeedProps) {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const urlKind = searchParams.get("kind");
  const [scope, setScope] = useState<ActivityScope | "all">(() => {
    const urlScope = searchParams.get("scope");
    if (urlScope === "mine" || urlScope === "received" || urlScope === "all") {
      return urlScope;
    }
    return initialScope;
  });
  const [items, setItems] = useState<ActivityRecord[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope !== "all") params.set("scope", scope);
      if (urlKind) params.set("kind", urlKind);
      params.set("pageSize", compact ? "5" : "20");
      const response = await fetch(`/api/activity?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        setItems([]);
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setSummary(data.summary ?? null);
    } finally {
      setLoading(false);
    }
  }, [compact, scope, urlKind]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  async function patchStatus(item: ActivityRecord, status: string) {
    setBusyId(item.id);
    try {
      const response = await fetch(`/api/activity/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, status }),
      });
      if (!response.ok) {
        showToast("تعذر تحديث الحالة", "error");
        return;
      }
      showToast("تم تحديث الحالة");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <LocalizedTree>
    <div>
      {showScopeTabs ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {[
            { value: "all" as const, label: "الكل" },
            { value: "mine" as const, label: "طلباتي" },
            { value: "received" as const, label: "الوارد" },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                scope === tab.value
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-muted"
              }`}
              onClick={() => setScope(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">جاري تحميل النشاط...</p>
      ) : items.length === 0 ? (
        <EmptyState
          actionHref="/search"
          actionLabel="استكشف السوق"
          description="ستظهر هنا طلباتك وحجوزاتك ومشترياتك وإعلاناتك."
          icon="search"
          title="لا نشاط حتى الآن"
        />
      ) : (
        <ul className="grid gap-1.5">
          {items.map((item) => {
            const statusOptions =
              manageReceived && item.scope === "received" && RECEIVED_KINDS.has(item.kind)
                ? STATUS_OPTIONS[item.kind]
                : undefined;
            return (
              <li
                key={`${item.kind}-${item.id}`}
                className="rounded-lg border border-border/70 bg-surface px-3 py-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted">
                        {activityKindLabel(item.kind)}
                      </span>
                      <span className="rounded-full bg-secondary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {item.statusLabel}
                      </span>
                    </div>
                    <Link className="mt-1 block truncate text-sm font-semibold text-ink" href={item.href}>
                      {item.title}
                    </Link>
                    {item.subtitle ? (
                      <p className="mt-0.5 truncate text-[11px] text-muted">{item.subtitle}</p>
                    ) : null}
                    <p className="mt-0.5 text-[10px] text-muted">{formatWhen(item.updatedAt)}</p>
                    {item.nextAction ? (
                      <p className="mt-1 text-[11px] font-medium text-primary">{item.nextAction}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Link
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-primary hover:bg-secondary-soft"
                      href={item.href}
                    >
                      <Icon name="chevron-left" size={12} />
                      فتح
                    </Link>
                    {statusOptions?.map((option) => (
                      <Button
                        key={option.value}
                        loading={busyId === item.id}
                        onClick={() => void patchStatus(item, option.value)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!compact && summary ? (
        <p className="mt-2 text-[11px] text-muted">
          {summary.mineTotal} نشاط شخصي · {summary.receivedTotal} وارد
        </p>
      ) : null}
    </div>
    </LocalizedTree>
  );
}
