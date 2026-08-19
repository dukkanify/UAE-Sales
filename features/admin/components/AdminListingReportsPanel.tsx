"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ListingReport } from "@/types/domain/listing-report";
import { LISTING_REPORT_REASON_LABELS } from "@/types/domain/listing-report";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("971")
    ? digits
    : digits.startsWith("0")
      ? `971${digits.slice(1)}`
      : digits.startsWith("5")
        ? `971${digits}`
        : digits;
  return `tel:+${normalized}`;
}

function toWhatsAppHref(phone: string): string {
  const digits = toTelHref(phone).replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function AdminListingReportsPanel() {
  const [items, setItems] = useState<ListingReport[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/listing-reports")
      .then((res) => res.json())
      .then((data) => setItems(data.reports ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function markReviewed(id: string) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await adminFetch(`/api/admin/listing-reports/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });
      const data = await res.json();
      if (res.ok && data.report) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.report : item)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  const openCount = items.filter((item) => item.status === "open").length;
  const guestCount = items.filter((item) => item.guest).length;

  return (
    <div className="grid gap-3">
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">كل البلاغات</p>
          <p className="admin-ops__kpi-value">{items.length}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">جديدة</p>
          <p className="admin-ops__kpi-value">{openCount}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">من زوار بدون حساب</p>
          <p className="admin-ops__kpi-value">{guestCount}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد بلاغات على الإعلانات بعد.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => {
            const listingHref = item.listingSlug
              ? `/listings/${item.listingSlug}`
              : `/listings/${item.listingId}`;
            return (
              <li key={item.id} className="admin-ops__queue-item">
                <div className="min-w-0">
                  <p className="admin-ops__queue-label">{item.listingTitle}</p>
                  <p className="admin-ops__queue-meta" dir="ltr">
                    {item.id}
                  </p>
                  <p className="admin-ops__queue-meta">
                    السبب: {LISTING_REPORT_REASON_LABELS[item.reason]}
                    {item.details ? ` — ${item.details}` : ""}
                  </p>
                  <p className="admin-ops__queue-meta">
                    العميل المُبلِغ: {item.reporterName}
                    {item.guest ? " (زائر بدون حساب)" : " (حساب مسجّل)"}
                  </p>
                  <p className="admin-ops__queue-meta">
                    <a className="admin-ops__text-link" href={`mailto:${item.reporterEmail}`}>
                      {item.reporterEmail}
                    </a>
                    {" · "}
                    <a
                      className="admin-ops__text-link"
                      dir="ltr"
                      href={toTelHref(item.reporterPhone)}
                    >
                      {item.reporterPhone}
                    </a>
                    {" · "}
                    <a
                      className="admin-ops__text-link"
                      href={toWhatsAppHref(item.reporterPhone)}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      واتساب
                    </a>
                  </p>
                  <p className="admin-ops__queue-meta">
                    البائع: {item.sellerName ?? "—"} ·{" "}
                    {new Date(item.createdAt).toLocaleString("ar-AE")}
                  </p>
                  <Link className="admin-ops__text-link" href={listingHref}>
                    فتح الإعلان
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`admin-ops__status-chip${
                      item.status === "open" ? " admin-ops__status-chip--warn" : ""
                    }`}
                  >
                    {item.status === "open" ? "جديد" : "تمت المراجعة"}
                  </span>
                  {item.status === "open" ? (
                    <Button
                      disabled={busyId === item.id}
                      onClick={() => void markReviewed(item.id)}
                      size="sm"
                      variant="secondary"
                    >
                      تمت المراجعة
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
