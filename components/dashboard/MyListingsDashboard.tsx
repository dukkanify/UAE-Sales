"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Category, Listing, ListingStatus } from "@/types";
import { listingStatusLabels } from "@/constants/listingStatuses";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import {
  deleteLocalListing,
  getLocalListings,
} from "@/services/clientStorage";

type MyListingsDashboardProps = {
  categories: Category[];
  listings: Listing[];
};

const statusOrder: ListingStatus[] = [
  "active",
  "pending_review",
  "draft",
  "expired",
  "rejected",
];

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const recentActivity = [
  { action: "عرض جديد على إعلانك", listing: "آيفون 15 برو", time: "منذ ساعتين" },
  { action: "تم نشر إعلان", listing: "كنب فاخر", time: "أمس" },
  { action: "رسالة من مشتري", listing: "لاند كروزر", time: "منذ يومين" },
];

export function MyListingsDashboard({
  categories,
  listings,
}: MyListingsDashboardProps) {
  const [activeStatus, setActiveStatus] = useState("all");
  const [localListings, setLocalListings] = useState<Listing[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const allListings = useMemo(
    () => [...localListings, ...listings],
    [listings, localListings],
  );
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const counts = Object.fromEntries(
    statusOrder.map((status) => [
      status,
      allListings.filter((listing) => listing.status === status).length,
    ]),
  );

  const filteredListings =
    activeStatus === "all"
      ? allListings
      : allListings.filter((listing) => listing.status === activeStatus);

  const tabs = [
    { count: allListings.length, id: "all", label: "الكل" },
    ...statusOrder.map((status) => ({
      count: counts[status],
      id: status,
      label: listingStatusLabels[status],
    })),
  ];

  useEffect(() => {
    const syncLocalListings = () => setLocalListings(getLocalListings());

    syncLocalListings();
    window.addEventListener("uae-sales-listings-change", syncLocalListings);

    return () =>
      window.removeEventListener("uae-sales-listings-change", syncLocalListings);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "إعلانات نشطة", value: counts.active, icon: "✓" },
          { label: "قيد المراجعة", value: counts.pending_review, icon: "🔍" },
          { label: "مسودات", value: counts.draft, icon: "📝" },
          { label: "إجمالي المشاهدات", value: "3,240", icon: "👁" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <span aria-hidden className="text-lg">
                {stat.icon}
              </span>
              <p className="text-2xl font-black text-ink">{stat.value}</p>
            </div>
            <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-black text-ink">إدارة الإعلانات</h2>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:-translate-y-px"
              href="/listings/new"
            >
              إضافة إعلان
            </Link>
          </div>
          <div className="mt-5">
            <Tabs
              activeId={activeStatus}
              onChange={setActiveStatus}
              tabs={tabs}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-black text-ink">النشاط الأخير</h3>
          <div className="mt-4 grid gap-3">
            {recentActivity.map((item) => (
              <div key={item.listing} className="rounded-xl bg-surface-muted p-3">
                <p className="text-xs font-bold text-ink">{item.action}</p>
                <p className="mt-1 text-xs font-medium text-muted">
                  {item.listing} — {item.time}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {actionMessage ? (
        <Card className="border-success/20 bg-success-soft p-4 text-sm font-bold text-success">
          {actionMessage}
        </Card>
      ) : null}

      {filteredListings.length === 0 ? (
        <EmptyState
          actionHref="/listings/new"
          actionLabel="أضف أول إعلان"
          description="لم تقم بإضافة أي إعلانات بعد. ابدأ الآن وستظهر هنا فوراً."
          icon="📋"
          title="لا توجد إعلانات"
        />
      ) : (
        <div className="grid gap-3">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden p-0">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-ink">{listing.title}</h4>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">
                    {listing.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-muted">
                    <span>{categoryNames.get(listing.categoryId)}</span>
                    <span>{listing.city}</span>
                    <span>{priceFormatter.format(listing.price)} د.إ</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex min-h-9 items-center rounded-xl border border-border px-4 text-xs font-bold text-ink transition hover:border-primary"
                    href={
                      listing.id.startsWith("local-")
                        ? `/listings/local/${listing.id}`
                        : `/listings/${listing.slug}`
                    }
                  >
                    عرض
                  </Link>
                  <Link
                    className="inline-flex min-h-9 items-center rounded-xl bg-secondary-soft px-4 text-xs font-bold text-primary"
                    href={
                      listing.id.startsWith("local-")
                        ? `/listings/local/${listing.id}/edit`
                        : `/listings/${listing.slug}/edit`
                    }
                  >
                    تعديل
                  </Link>
                  {listing.id.startsWith("local-") ? (
                    <button
                      className="inline-flex min-h-9 items-center rounded-xl bg-accent-soft px-4 text-xs font-bold text-accent"
                      onClick={() => {
                        deleteLocalListing(listing.id);
                        setActionMessage("تم حذف الإعلان.");
                      }}
                      type="button"
                    >
                      حذف
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
