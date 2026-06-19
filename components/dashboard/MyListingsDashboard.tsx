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
  const [localListings, setLocalListings] = useState<Listing[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const allListings = useMemo(
    () => [...localListings, ...listings],
    [listings, localListings],
  );
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const counts = statusOrder.map((status) => ({
    count: allListings.filter((listing) => listing.status === status).length,
    status,
  }));

  useEffect(() => {
    const syncLocalListings = () => setLocalListings(getLocalListings());

    syncLocalListings();
    window.addEventListener("uae-sales-listings-change", syncLocalListings);

    return () =>
      window.removeEventListener("uae-sales-listings-change", syncLocalListings);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        {counts.map(({ count, status }) => (
          <Card key={status} className="p-5">
            <p className="text-3xl font-black text-primary">{count}</p>
            <p className="mt-2 text-sm font-bold text-muted">
              {listingStatusLabels[status]}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">إدارة الإعلانات</h2>
            <p className="mt-2 leading-8 text-muted">
              واجهة جاهزة لربط عمليات التعديل، إعادة النشر، حذف المسودات،
              ومراجعة أسباب الرفض.
            </p>
          </div>
          <Link
            href="/listings/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            إضافة إعلان جديد
          </Link>
        </div>
      </Card>
      {actionMessage ? (
        <Card className="border-secondary/30 bg-secondary-soft p-4 text-sm font-black text-primary">
          {actionMessage}
        </Card>
      ) : null}

      {statusOrder.map((status) => {
        const statusListings = allListings.filter(
          (listing) => listing.status === status,
        );

        return (
          <section key={status} className="grid gap-4">
            <div>
              <h3 className="text-xl font-black text-ink">
                {listingStatusLabels[status]}
              </h3>
              <p className="mt-1 text-sm font-bold text-muted">
                {listingStatusDescriptions[status]}
              </p>
            </div>

            {statusListings.length > 0 ? (
              <div className="grid gap-4">
                {statusListings.map((listing) => (
                  <Card key={listing.id} className="p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="flex gap-4">
                        <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary-soft text-xl font-black text-primary">
                          {categoryNames.get(listing.categoryId)?.slice(0, 2) ??
                            "إع"}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-black text-ink">
                              {listing.title}
                            </h4>
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
                            <span>
                              {priceFormatter.format(listing.price)} د.إ
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Link
                          href={
                            listing.id.startsWith("local-")
                              ? `/listings/local/${listing.id}`
                              : `/listings/${listing.slug}`
                          }
                          className="rounded-full border border-border px-4 py-2 text-sm font-black text-ink transition hover:border-primary hover:text-primary"
                        >
                          عرض
                        </Link>
                        <Link
                          href={
                            listing.id.startsWith("local-")
                              ? `/listings/local/${listing.id}/edit`
                              : `/listings/${listing.slug}/edit`
                          }
                          className="rounded-full bg-secondary-soft px-4 py-2 text-sm font-black text-primary transition hover:bg-secondary"
                        >
                          تعديل
                        </Link>
                        {listing.id.startsWith("local-") ? (
                          <button
                            className="rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                            onClick={() => deleteLocalListing(listing.id)}
                            type="button"
                          >
                            حذف
                          </button>
                        ) : null}
                        {listing.status === "expired" ? (
                          <button
                            className="rounded-full bg-accent-soft px-4 py-2 text-sm font-black text-amber-800"
                            onClick={() =>
                              setActionMessage(
                                "تم تجهيز طلب إعادة النشر في تجربة الديمو. سيتم ربطه بالـ API لاحقاً.",
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
            ) : (
              <Card className="p-6 text-sm font-bold text-muted">
                لا توجد إعلانات في هذه الحالة حالياً.
              </Card>
            )}
          </section>
        );
      })}
    </div>
  );
}
