"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Listing, ListingStatus } from "@/types";
import { listingStatusLabels } from "@/shared/constants/listingStatuses";
import { ListingStatusBadge } from "@/features/listings/components/ListingStatusBadge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { Tabs } from "@/shared/ui/Tabs";
import {
  deleteLocalListing,
  getLocalListings,
} from "@/services/storage";

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

  const totalViews = allListings.reduce((sum, listing) => sum + listing.views, 0);

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
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "check" as const, label: "نشطة", value: counts.active },
          { icon: "clock" as const, label: "قيد المراجعة", value: counts.pending_review },
          { icon: "edit" as const, label: "مسودات", value: counts.draft },
          { icon: "eye" as const, label: "مشاهدات", value: totalViews.toLocaleString("ar-AE") },
        ].map((stat) => (
          <Card key={stat.label} className="p-5" variant="flat">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                <Icon name={stat.icon} size={18} />
              </span>
              <p className="text-xl font-semibold text-ink">{stat.value}</p>
            </div>
            <p className="mt-2 text-xs font-medium text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5" variant="flat">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">إعلاناتي</h2>
          <Button href="/listings/new" size="sm" variant="primary">
            إضافة
          </Button>
        </div>
        <div className="mt-4">
          <Tabs activeId={activeStatus} onChange={setActiveStatus} tabs={tabs} />
        </div>
      </Card>

      {actionMessage ? (
        <FormMessage variant="success">{actionMessage}</FormMessage>
      ) : null}

      {filteredListings.length === 0 ? (
        <EmptyState
          actionHref="/listings/new"
          actionLabel="أضف إعلان"
          description="لم تقم بإضافة أي إعلانات بعد."
          icon="package"
          title="لا توجد إعلانات"
        />
      ) : (
        <div className="grid gap-3">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="p-5" variant="flat">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-ink">{listing.title}</h4>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <p className="mt-1.5 flex flex-wrap gap-3 text-xs font-medium text-muted">
                    <span>{categoryNames.get(listing.categoryId)}</span>
                    <span>{listing.city}</span>
                    <span>{priceFormatter.format(listing.price)} د.إ</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    href={
                      listing.id.startsWith("local-")
                        ? `/listings/local/${listing.id}`
                        : `/listings/${listing.slug}`
                    }
                    size="sm"
                    variant="secondary"
                  >
                    عرض
                  </Button>
                  <Button
                    href={
                      listing.id.startsWith("local-")
                        ? `/listings/local/${listing.id}/edit`
                        : `/listings/${listing.slug}/edit`
                    }
                    size="sm"
                    variant="ghost"
                  >
                    تعديل
                  </Button>
                  {listing.id.startsWith("local-") ? (
                    <Button
                      onClick={() => {
                        deleteLocalListing(listing.id);
                        setActionMessage("تم حذف الإعلان.");
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      حذف
                    </Button>
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
