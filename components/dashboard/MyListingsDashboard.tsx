"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Category, Listing, ListingStatus } from "@/types";
import {
  listingStatusDescriptions,
  listingStatusLabels,
} from "@/constants/listingStatuses";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
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

const statusIcons: Record<ListingStatus, string> = {
  active: "✓",
  draft: "📝",
  expired: "⏳",
  pending_review: "🔍",
  rejected: "✕",
};

const toneClasses: Record<Listing["imageTone"], string> = {
  amber: "from-amber-200 via-white to-orange-300",
  gold: "from-stone-200 via-white to-yellow-200",
  rose: "from-rose-200 via-white to-pink-300",
  sky: "from-sky-200 via-white to-blue-300",
  slate: "from-slate-200 via-white to-slate-400",
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function MyListingsDashboard({
  categories,
  listings,
}: MyListingsDashboardProps) {
  const [activeStatus, setActiveStatus] = useState<ListingStatus | "all">("all");
  const [localListings, setLocalListings] = useState<Listing[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const allListings = useMemo(
    () => [...localListings, ...listings],
    [listings, localListings],
  );
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const categoryIcons = new Map(
    categories.map((category) => [category.id, category.icon]),
  );

  const counts = statusOrder.map((status) => ({
    count: allListings.filter((listing) => listing.status === status).length,
    status,
  }));

  const filteredListings =
    activeStatus === "all"
      ? allListings
      : allListings.filter((listing) => listing.status === activeStatus);

  useEffect(() => {
    const syncLocalListings = () => setLocalListings(getLocalListings());

    syncLocalListings();
    window.addEventListener("uae-sales-listings-change", syncLocalListings);

    return () =>
      window.removeEventListener("uae-sales-listings-change", syncLocalListings);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map(({ count, status }) => (
          <button
            key={status}
            className={`rounded-2xl border p-4 text-right transition ${
              activeStatus === status
                ? "border-secondary bg-secondary-soft shadow-sm"
                : "border-border bg-white hover:border-secondary/40"
            }`}
            onClick={() => setActiveStatus(status)}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg" aria-hidden>
                {statusIcons[status]}
              </span>
              <p className="text-2xl font-black text-primary">{count}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-muted">
              {listingStatusLabels[status]}
            </p>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-5 md:p-6">
        <div className="uae-flag-strip -mx-5 -mt-5 mb-5 h-1.5 md:-mx-6 md:-mt-6" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">إدارة الإعلانات</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              تابع إعلاناتك، عدّلها، أو أعد نشر المنتهية من مكان واحد.
            </p>
          </div>
          <Link
            href="/listings/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            إضافة إعلان جديد
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              activeStatus === "all"
                ? "bg-primary text-white"
                : "bg-surface-muted text-muted hover:text-primary"
            }`}
            onClick={() => setActiveStatus("all")}
            type="button"
          >
            الكل ({allListings.length})
          </button>
          {statusOrder.map((status) => (
            <button
              key={status}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                activeStatus === status
                  ? "bg-primary text-white"
                  : "bg-surface-muted text-muted hover:text-primary"
              }`}
              onClick={() => setActiveStatus(status)}
              type="button"
            >
              {listingStatusLabels[status]}
            </button>
          ))}
        </div>
      </Card>

      {actionMessage ? (
        <Card className="border-secondary/30 bg-secondary-soft p-4 text-sm font-black text-primary">
          {actionMessage}
        </Card>
      ) : null}

      {filteredListings.length === 0 ? (
        <EmptyState
          actionHref="/listings/new"
          actionLabel="أضف أول إعلان"
          description={
            activeStatus === "all"
              ? "لم تقم بإضافة أي إعلانات بعد. ابدأ بنشر إعلانك الأول وستظهر هنا فوراً."
              : `لا توجد إعلانات بحالة "${listingStatusLabels[activeStatus as ListingStatus]}" حالياً.`
          }
          icon="📋"
          title="لا توجد إعلانات"
        />
      ) : (
        <div className="grid gap-4">
          {activeStatus !== "all" ? (
            <p className="text-sm font-bold text-muted">
              {listingStatusDescriptions[activeStatus]}
            </p>
          ) : null}

          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden p-0">
              <div className="grid gap-0 md:grid-cols-[9rem_1fr_auto] md:items-stretch">
                <div
                  className={`relative min-h-32 bg-gradient-to-br md:min-h-full ${toneClasses[listing.imageTone]}`}
                >
                  {listing.imageUrl ? (
                    <div
                      aria-label={listing.title}
                      className="absolute inset-0 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${listing.imageUrl})` }}
                    />
                  ) : (
                    <div className="grid h-full min-h-32 place-items-center">
                      <span className="text-3xl">
                        {categoryIcons.get(listing.categoryId) ?? "📦"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(17,24,39,0.12))]" />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-black text-ink">{listing.title}</h4>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 leading-7 text-muted">
                    {listing.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-muted">
                    <span>{categoryNames.get(listing.categoryId)}</span>
                    <span>•</span>
                    <span>{listing.city}</span>
                    <span>•</span>
                    <span>{priceFormatter.format(listing.price)} د.إ</span>
                    <span>•</span>
                    <span>
                      {listing.views.toLocaleString("ar-AE")} مشاهدة
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border p-4 md:flex-col md:justify-center md:border-r md:border-t-0 md:p-5">
                  <Link
                    href={
                      listing.id.startsWith("local-")
                        ? `/listings/local/${listing.id}`
                        : `/listings/${listing.slug}`
                    }
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-black text-ink transition hover:border-primary hover:text-primary md:flex-none"
                  >
                    عرض
                  </Link>
                  <Link
                    href={
                      listing.id.startsWith("local-")
                        ? `/listings/local/${listing.id}/edit`
                        : `/listings/${listing.slug}/edit`
                    }
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-secondary-soft px-4 py-2 text-sm font-black text-primary transition hover:bg-secondary md:flex-none"
                  >
                    تعديل
                  </Link>
                  {listing.id.startsWith("local-") ? (
                    <button
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100 md:flex-none"
                      onClick={() => {
                        deleteLocalListing(listing.id);
                        setActionMessage("تم حذف الإعلان بنجاح.");
                      }}
                      type="button"
                    >
                      حذف
                    </button>
                  ) : null}
                  {listing.status === "expired" ? (
                    <button
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-accent-soft px-4 py-2 text-sm font-black text-amber-800 md:flex-none"
                      onClick={() =>
                        setActionMessage(
                          "تم تجهيز طلب إعادة النشر. سيتم تفعيله عند ربط المنصة بالخادم.",
                        )
                      }
                      type="button"
                    >
                      إعادة نشر
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
