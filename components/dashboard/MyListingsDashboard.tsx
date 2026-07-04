"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Listing, ListingStatus } from "@/types";
import { listingStatusLabels } from "@/constants/listingStatuses";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormMessage } from "@/components/ui/FormMessage";
import { Icon } from "@/components/ui/Icon";
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
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "check" as const, label: "نشطة", value: counts.active },
          { icon: "clock" as const, label: "قيد المراجعة", value: counts.pending_review },
          { icon: "edit" as const, label: "مسودات", value: counts.draft },
          { icon: "eye" as const, label: "مشاهدات", value: "3,240" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4" variant="flat">
            <div className="flex items-center justify-between">
              <Icon className="text-secondary" name={stat.icon} size={18} />
              <p className="text-xl font-black text-ink">{stat.value}</p>
            </div>
            <p className="mt-1 text-xs font-medium text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4" variant="flat">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black text-ink">إعلاناتي</h2>
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
        <div className="grid gap-2">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="p-4" variant="flat">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-ink">{listing.title}</h4>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <p className="mt-1 flex flex-wrap gap-3 text-xs font-medium text-muted">
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
