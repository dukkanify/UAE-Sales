"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminListingRecord, ListingStatus } from "@/types";
import { listingStatusLabels } from "@/shared/constants/listingStatuses";
import { getLocalListings, getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { Select } from "@/shared/ui/Select";

const statusFilterOptions: { label: string; value: string }[] = [
  { label: "كل الحالات", value: "all" },
  { label: listingStatusLabels.pending_review, value: "pending_review" },
  { label: listingStatusLabels.active, value: "active" },
  { label: listingStatusLabels.rejected, value: "rejected" },
  { label: listingStatusLabels.draft, value: "draft" },
  { label: listingStatusLabels.expired, value: "expired" },
];

function listingBadgeVariant(
  status: ListingStatus,
): "verified" | "pending" | "rejected" | "muted" | "sold" {
  if (status === "active") return "verified";
  if (status === "pending_review") return "pending";
  if (status === "rejected") return "rejected";
  if (status === "expired") return "sold";
  return "muted";
}

export function AdminListingsPanel() {
  const [listings, setListings] = useState<AdminListingRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;

    const timeoutId = window.setTimeout(() => {
      const localListings = getLocalListings();
      const sync =
        localListings.length > 0
          ? fetch("/api/admin/listings", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-admin-role": "admin",
              },
              body: JSON.stringify({ listings: localListings }),
            }).then((res) => res.json())
          : fetch("/api/admin/listings", {
              headers: { "x-admin-role": "admin" },
            }).then((res) => res.json());

      sync
        .then((data) => setListings(data.listings ?? []))
        .catch(() => setListings([]));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return listings;
    return listings.filter((listing) => listing.status === statusFilter);
  }, [listings, statusFilter]);

  async function patchListing(
    id: string,
    patch: Partial<Pick<AdminListingRecord, "status" | "isFeatured">>,
  ) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (response.ok && data.listing) {
        setListings((prev) =>
          prev.map((listing) => (listing.id === id ? data.listing : listing)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="p-4" variant="flat">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <Select
              label="تصفية حسب الحالة"
              onChange={(event) => setStatusFilter(event.target.value)}
              options={statusFilterOptions}
              value={statusFilter}
            />
          </div>
          <p className="pb-2 text-xs text-muted">
            <Icon className="ms-1 inline" name="package" size={14} />
            {filtered.length} إعلان
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد إعلانات مطابقة.</p>
        </Card>
      ) : (
        filtered.map((listing) => (
          <Card key={listing.id} className="p-5" variant="flat">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{listing.title}</p>
                <p className="mt-1 text-xs text-muted">{listing.slug}</p>
                <p className="mt-2 text-sm">
                  {listing.sellerName} — {listing.city}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={listingBadgeVariant(listing.status)}>
                    {listingStatusLabels[listing.status]}
                  </Badge>
                  {listing.isFeatured ? (
                    <Badge variant="featured">مميّز</Badge>
                  ) : null}
                </div>
              </div>
              <div className="text-left">
                <CurrencyAmount amount={listing.price} size="lg" />
                <p className="mt-1 text-xs text-muted">
                  {new Date(listing.postedAt).toLocaleDateString("ar-AE")}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.status === "pending_review" ||
              listing.status === "rejected" ||
              listing.status === "draft" ? (
                <Button
                  loading={busyId === listing.id}
                  onClick={() =>
                    patchListing(listing.id, { status: "active" })
                  }
                  size="sm"
                  variant="primary"
                >
                  اعتماد
                </Button>
              ) : null}
              {listing.status !== "rejected" ? (
                <Button
                  loading={busyId === listing.id}
                  onClick={() =>
                    patchListing(listing.id, { status: "rejected" })
                  }
                  size="sm"
                  variant="ghost"
                >
                  رفض
                </Button>
              ) : null}
              <Button
                loading={busyId === listing.id}
                onClick={() =>
                  patchListing(listing.id, {
                    isFeatured: !listing.isFeatured,
                  })
                }
                size="sm"
                variant="secondary"
              >
                {listing.isFeatured ? "إلغاء التمييز" : "تمييز"}
              </Button>
              <Button href={`/listings/${listing.slug}`} size="sm" variant="ghost">
                عرض
              </Button>
            </div>
          </Card>
        ))
      )}

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
