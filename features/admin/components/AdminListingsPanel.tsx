"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminCategoryRecord, AdminListingRecord, ListingStatus } from "@/types";
import { cities } from "@/shared/constants/locations";
import { listingStatusLabels } from "@/shared/constants/listingStatuses";
import { getLocalListings, getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";

const statusFilterOptions: { label: string; value: string }[] = [
  { label: "كل الحالات", value: "all" },
  { label: listingStatusLabels.pending_review, value: "pending_review" },
  { label: listingStatusLabels.active, value: "active" },
  { label: listingStatusLabels.rejected, value: "rejected" },
  { label: listingStatusLabels.draft, value: "draft" },
  { label: listingStatusLabels.expired, value: "expired" },
];

const conditionOptions = [
  { label: "مستعمل", value: "used" },
  { label: "جديد", value: "new" },
  { label: "ممتاز", value: "excellent" },
];

const publishStatusOptions = [
  { label: "نشط فوراً", value: "active" },
  { label: "بانتظار المراجعة", value: "pending_review" },
  { label: "مسودة", value: "draft" },
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

const emptyForm = {
  title: "",
  description: "",
  categoryId: "",
  city: "دبي",
  price: "",
  condition: "used",
  status: "active",
  sellerName: "",
  isFeatured: false,
  isUrgent: false,
};

export function AdminListingsPanel() {
  const [listings, setListings] = useState<AdminListingRecord[]>([]);
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState(emptyForm);

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

      fetch("/api/admin/categories", { headers: { "x-admin-role": "admin" } })
        .then((res) => res.json())
        .then((data) => {
          const rows = (data.categories ?? []) as AdminCategoryRecord[];
          setCategories(rows);
          setForm((current) =>
            current.categoryId
              ? current
              : { ...current, categoryId: rows.find((row) => row.enabled)?.id ?? rows[0]?.id ?? "" },
          );
        })
        .catch(() => setCategories([]));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return listings;
    return listings.filter((listing) => listing.status === statusFilter);
  }, [listings, statusFilter]);

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.enabled)
        .map((category) => ({ label: category.name, value: category.id })),
    [categories],
  );

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

  async function handleCreate() {
    const session = getSessionUser();
    if (!session) return;

    const price = Number(form.price);
    if (!form.title.trim() || !form.categoryId || !form.city || !Number.isFinite(price) || price <= 0) {
      setCreateError("أكمل العنوان والقسم والمدينة وسعرًا صحيحًا.");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      const response = await fetch("/api/admin/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({
          create: {
            title: form.title.trim(),
            description: form.description.trim(),
            categoryId: form.categoryId,
            city: form.city,
            price,
            condition: form.condition,
            status: form.status,
            isFeatured: form.isFeatured,
            isUrgent: form.isUrgent,
            sellerName: form.sellerName.trim() || undefined,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCreateError("تعذر حفظ الإعلان. حاول مرة أخرى.");
        return;
      }
      if (data.listings) {
        setListings(data.listings);
      } else if (data.listing) {
        setListings((prev) => [data.listing, ...prev]);
      }
      setForm((current) => ({
        ...emptyForm,
        categoryId: current.categoryId,
        city: current.city,
      }));
    } catch {
      setCreateError("تعذر الاتصال بالخادم.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="p-5" variant="flat">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="plus" size={16} />
            إضافة إعلان من لوحة التحكم
          </h2>
          <Button href="/listings/new" size="sm" variant="ghost">
            النموذج الكامل للموقع
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="عنوان الإعلان"
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="مثال: تويوتا كامري 2022"
            value={form.title}
          />
          <Input
            label="السعر (د.إ)"
            inputMode="numeric"
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            placeholder="85000"
            value={form.price}
          />
          <Select
            label="القسم"
            onChange={(event) =>
              setForm((current) => ({ ...current, categoryId: event.target.value }))
            }
            options={
              categoryOptions.length > 0
                ? categoryOptions
                : [{ label: "جاري التحميل...", value: "" }]
            }
            value={form.categoryId}
          />
          <Select
            label="المدينة"
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            options={cities.map((city) => ({ label: city.name, value: city.name }))}
            value={form.city}
          />
          <Select
            label="الحالة"
            onChange={(event) =>
              setForm((current) => ({ ...current, condition: event.target.value }))
            }
            options={conditionOptions}
            value={form.condition}
          />
          <Select
            label="حالة النشر"
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            options={publishStatusOptions}
            value={form.status}
          />
          <Input
            label="اسم البائع (اختياري)"
            onChange={(event) =>
              setForm((current) => ({ ...current, sellerName: event.target.value }))
            }
            placeholder="إدارة سوقنا"
            value={form.sellerName}
          />
          <div className="grid content-end gap-2 sm:col-span-2">
            <Textarea
              label="الوصف (اختياري)"
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="تفاصيل مختصرة تظهر في صفحة الإعلان"
              rows={3}
              value={form.description}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink">
          <label className="inline-flex items-center gap-2">
            <input
              checked={form.isFeatured}
              onChange={(event) =>
                setForm((current) => ({ ...current, isFeatured: event.target.checked }))
              }
              type="checkbox"
            />
            مميز
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              checked={form.isUrgent}
              onChange={(event) =>
                setForm((current) => ({ ...current, isUrgent: event.target.checked }))
              }
              type="checkbox"
            />
            عاجل
          </label>
        </div>

        {createError ? (
          <p className="mt-3 text-sm font-medium text-error">{createError}</p>
        ) : null}

        <div className="mt-4">
          <Button loading={creating} onClick={handleCreate} variant="primary">
            نشر الإعلان
          </Button>
        </div>
      </Card>

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
