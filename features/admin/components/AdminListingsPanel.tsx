"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminListingRecord } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { fetchAdminListings, patchAdminListingClient } from "@/services/admin";
import { mockCategories } from "@/mock/categories.mock";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const emirates = ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"];

export function AdminListingsPanel() {
  const [listings, setListings] = useState<AdminListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [emirate, setEmirate] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminListings({ status, categoryId, emirate });
    setListings(data);
    setLoading(false);
  }, [status, categoryId, emirate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadListings();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadListings]);

  async function handlePatch(
    id: string,
    patch: Parameters<typeof patchAdminListingClient>[1],
  ) {
    setActionLoading(true);
    const updated = await patchAdminListingClient(id, patch);
    if (updated) {
      setListings((items) => items.map((item) => (item.id === id ? updated : item)));
    }
    setActionLoading(false);
  }

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <Card className="marketplace-panel p-6" variant="flat">
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="pending_review">بانتظار المراجعة</option>
          <option value="rejected">مرفوض</option>
          <option value="draft">مسودة</option>
        </select>
        <select
          className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
          onChange={(event) => setCategoryId(event.target.value)}
          value={categoryId}
        >
          <option value="all">كل التصنيفات</option>
          {mockCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
          onChange={(event) => setEmirate(event.target.value)}
          value={emirate}
        >
          <option value="all">كل الإمارات</option>
          {emirates.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {listings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            description="لا توجد إعلانات تطابق الفلاتر المحددة."
            icon="package"
            title="لا توجد إعلانات"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-[var(--radius-xl)] border border-border/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{listing.title}</h3>
                    {listing.featured ? <Badge variant="featured">مميز</Badge> : null}
                    {listing.premium ? <Badge variant="premium">بريميوم</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {listing.categoryName} · {listing.emirate ?? "—"} · {listing.sellerName}
                  </p>
                  <p className="mt-2 text-sm font-bold text-primary">
                    {priceFormatter.format(listing.price)} د.إ
                  </p>
                </div>
                <AdminStatusBadge status={listing.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  disabled={actionLoading}
                  onClick={() => handlePatch(listing.id, { status: "active" })}
                  size="sm"
                  variant="primary"
                >
                  موافقة
                </Button>
                <Button
                  disabled={actionLoading}
                  onClick={() => handlePatch(listing.id, { status: "rejected" })}
                  size="sm"
                  variant="secondary"
                >
                  رفض
                </Button>
                <Button
                  disabled={actionLoading}
                  onClick={() =>
                    handlePatch(listing.id, { featured: !listing.featured })
                  }
                  size="sm"
                  variant="ghost"
                >
                  {listing.featured ? "إلغاء التمييز" : "تمييز"}
                </Button>
                <Button
                  disabled={actionLoading}
                  onClick={() => handlePatch(listing.id, { status: "rejected" })}
                  size="sm"
                  variant="ghost"
                >
                  إزالة
                </Button>
                <Button href={`/listings/${listing.slug}`} size="sm" variant="ghost">
                  عرض
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
