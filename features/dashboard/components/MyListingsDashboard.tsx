"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Listing, ListingStatus } from "@/types";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { listingStatusLabels } from "@/shared/constants/listingStatuses";
import { PremiumListingCard } from "@/features/listings/components/PremiumListingCard";
import { ListingStatusBadge } from "@/features/listings/components/ListingStatusBadge";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { Tabs } from "@/shared/ui/Tabs";
import {
  deleteLocalListing,
  getLocalListingsForSeller,
  getSessionUser,
  saveLocalListing,
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

function readFeaturedSuccessFlag(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("featured") === "1";
}

export function MyListingsDashboard({
  categories,
  listings,
}: MyListingsDashboardProps) {
  const [activeStatus, setActiveStatus] = useState("all");
  const [localListings, setLocalListings] = useState<Listing[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Listing>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [featuredSuccess] = useState(readFeaturedSuccessFlag);

  const allListings = useMemo(() => {
    const byId = new Map<string, Listing>();
    for (const listing of listings) {
      byId.set(listing.id, overrides[listing.id] ?? listing);
    }
    for (const listing of localListings) {
      byId.set(listing.id, overrides[listing.id] ?? listing);
    }
    return Array.from(byId.values());
  }, [listings, localListings, overrides]);

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

  const successMessage =
    actionMessage ||
    (featuredSuccess ? "تم تمييز الإعلان بنجاح." : "");

  useEffect(() => {
    const syncLocalListings = () => {
      const user = getSessionUser();
      setLocalListings(user ? getLocalListingsForSeller(user.id) : []);
    };

    syncLocalListings();
    window.addEventListener(STORAGE_EVENTS.listingsChange, syncLocalListings);
    window.addEventListener(STORAGE_EVENTS.sessionChange, syncLocalListings);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.listingsChange, syncLocalListings);
      window.removeEventListener(STORAGE_EVENTS.sessionChange, syncLocalListings);
    };
  }, []);

  function applyListingUpdate(updated: Listing) {
    setOverrides((prev) => ({ ...prev, [updated.id]: updated }));
    if (updated.id.startsWith("local-")) {
      saveLocalListing(updated);
    }
  }

  async function handleRenew(listing: Listing) {
    setBusyId(listing.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await fetch(`/api/listings/${listing.id}/renew`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (!response.ok) {
        setActionError("تعذر تجديد الإعلان.");
        return;
      }
      applyListingUpdate(data.listing as Listing);
      setActionMessage("تم إرسال الإعلان للتجديد وهو قيد المراجعة.");
    } catch {
      setActionError("تعذر تجديد الإعلان.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleFeature(listing: Listing) {
    setBusyId(listing.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await fetch(`/api/listings/${listing.id}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionError(
          data.error === "ALREADY_FEATURED"
            ? "هذا الإعلان مميز بالفعل."
            : data.error === "UNAUTHORIZED"
              ? "سجّل الدخول من جديد لإتمام دفع الباقة."
              : data.error === "STRIPE_NOT_CONFIGURED"
                ? "بوابة الدفع غير مفعّلة حالياً."
                : "تعذر بدء تمييز الإعلان.",
        );
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }
      if (data.listing) {
        applyListingUpdate(data.listing as Listing);
      }
      setActionMessage("تم تمييز الإعلان بنجاح.");
    } catch {
      setActionError("تعذر بدء تمييز الإعلان.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "check" as const, label: "نشطة", value: counts.active },
          { icon: "clock" as const, label: "قيد المراجعة", value: counts.pending_review },
          { icon: "edit" as const, label: "مسودات", value: counts.draft },
          { icon: "eye" as const, label: "مشاهدات", value: totalViews.toLocaleString("ar-AE") },
        ].map((stat) => (
          <div key={stat.label} className="marketplace-stat-card p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                <Icon name={stat.icon} size={18} />
              </span>
              <p className="text-xl font-semibold text-ink">{stat.value}</p>
            </div>
            <p className="mt-2 text-xs font-medium text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="marketplace-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">إعلاناتي</h2>
          <Button href="/listings/new" size="sm" variant="primary">
            إضافة إعلان
          </Button>
        </div>
        <div className="mt-4">
          <Tabs activeId={activeStatus} onChange={setActiveStatus} tabs={tabs} />
        </div>
      </div>

      {successMessage ? (
        <FormMessage variant="success">{successMessage}</FormMessage>
      ) : null}
      {actionError ? <FormMessage variant="error">{actionError}</FormMessage> : null}

      {filteredListings.length === 0 ? (
        <EmptyState
          actionHref="/listings/new"
          actionLabel="أضف إعلان"
          description="لم تقم بإضافة أي إعلانات بعد."
          icon="package"
          title="لا توجد إعلانات"
        />
      ) : (
        <div className="grid gap-4">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="grid gap-2">
              <PremiumListingCard
                categoryName={categoryNames.get(listing.categoryId)}
                layout="row"
                listing={listing}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ListingStatusBadge status={listing.status} />
                  {listing.status === "expired" ? (
                    <span className="rounded-[var(--radius-md)] border border-error/20 bg-error-soft px-2 py-0.5 text-[11px] font-semibold text-error">
                      منتهي الصلاحية
                    </span>
                  ) : null}
                  {listing.isFeatured ? (
                    <span className="rounded-[var(--radius-md)] border border-[#c9a45c]/35 bg-[#c9a45c]/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      مميز
                    </span>
                  ) : null}
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
                {listing.status === "expired" ? (
                  <Button
                    loading={busyId === listing.id}
                    onClick={() => handleRenew(listing)}
                    size="sm"
                    variant="accent"
                  >
                    تجديد
                  </Button>
                ) : null}
                {!listing.isFeatured && listing.status !== "expired" ? (
                  <Button
                    loading={busyId === listing.id}
                    onClick={() => handleFeature(listing)}
                    size="sm"
                    variant="secondary"
                  >
                    تمييز الإعلان
                  </Button>
                ) : null}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
