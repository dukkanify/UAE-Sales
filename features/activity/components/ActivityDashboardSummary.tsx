"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ActivitySummary } from "@/types/domain/activity";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { Card } from "@/shared/ui/Card";

type ActivityDashboardSummaryProps = {
  role?: "user" | "business" | "admin";
};

const cards = [
  { key: "jobApplications", label: "طلبات التوظيف", href: "/profile?kind=job_application#activity", filter: "job_application" },
  { key: "viewingBookings", label: "حجوزات المعاينة", href: "/profile?kind=viewing_booking#activity", filter: "viewing_booking" },
  { key: "quoteRequests", label: "طلبات الخدمات", href: "/profile?kind=quote_request#activity", filter: "quote_request" },
  { key: "orders", label: "الطلبات", href: "/orders", filter: "order" },
  { key: "listings", label: "إعلاناتي", href: "/dashboard/listings", filter: "listing" },
  { key: "receivedTotal", label: "الوارد", href: "/profile?scope=received#activity", filter: "received" },
] as const;

export function ActivityDashboardSummary({ role = "user" }: ActivityDashboardSummaryProps) {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);

  useEffect(() => {
    void fetch("/api/activity?pageSize=1", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.summary) setSummary(data.summary as ActivitySummary);
      })
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return null;

  const visible =
    role === "business"
      ? cards
      : cards.filter((card) => card.key !== "receivedTotal" || summary.receivedTotal > 0);

  return (
    <LocalizedTree>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((card) => {
        const value =
          card.key === "receivedTotal"
            ? summary.receivedTotal
            : (summary[card.key as keyof ActivitySummary] as number);
        return (
          <Link key={card.key} href={card.href}>
            <Card className="p-4 transition hover:border-secondary" variant="flat">
              <p className="text-xs font-medium text-muted">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-ink">{value}</p>
            </Card>
          </Link>
        );
      })}
    </div>
    </LocalizedTree>
  );
}
