"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type {
  AdminCategoryRecord,
  AdminListingRecord,
  ListingStatus,
} from "@/types";
import { cities } from "@/shared/constants/locations";
import { isDynamicCategory } from "@/shared/constants/category-fields";
import { listingStatusLabels } from "@/shared/constants/listingStatuses";
import { getLocalListings, getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import {
  CategoryFieldsForm,
  type CategoryFieldErrors,
} from "@/features/listings/components/add-listing/CategoryFieldsForm";
import { parseCategoryForm } from "@/features/listings/components/add-listing/category-form-utils";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
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
  contactPhone: "",
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
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});
  const [form, setForm] = useState(emptyForm);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;

    const timeoutId = window.setTimeout(() => {
      const localListings = getLocalListings();
      const sync =
        localListings.length > 0
          ? adminFetch("/api/admin/listings", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ listings: localListings }),
            }).then((res) => res.json())
          : adminFetch("/api/admin/listings").then((res) => res.json());

      sync
        .then((data) => setListings(data.listings ?? []))
        .catch(() => setListings([]));

      adminFetch("/api/admin/categories")
        .then((res) => res.json())
        .then((data) => {
          const rows = (data.categories ?? []) as AdminCategoryRecord[];
          setCategories(rows);
          setForm((current) =>
            current.categoryId
              ? current
              : {
                  ...current,
                  categoryId:
                    rows.find((row) => row.enabled)?.id ?? rows[0]?.id ?? "",
                },
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

  const isDynamic = isDynamicCategory(form.categoryId);

  async function patchListing(
    id: string,
    patch: Partial<Pick<AdminListingRecord, "status" | "isFeatured">> & {
      rejectReason?: string;
    },
  ) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(id);
    try {
      const response = await adminFetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSessionUser();
    if (!session) return;

    const formData = new FormData(event.currentTarget);
    formData.set("categoryId", form.categoryId);
    formData.set("status", form.status);
    formData.set("description", form.description);
    if (!isDynamic) {
      formData.set("title", form.title);
      formData.set("price", form.price);
      formData.set("city", form.city);
      formData.set("condition", form.condition);
    } else {
      // Ensure price/description always present for parser
      formData.set("price", String(formData.get("price") ?? form.price));
      formData.set(
        "description",
        String(formData.get("description") ?? form.description),
      );
    }

    const parsed = parseCategoryForm(formData, form.categoryId);
    const nextErrors: CategoryFieldErrors = { ...parsed.errors };

    if (!form.categoryId) {
      nextErrors.category = "اختر القسم المناسب للإعلان.";
    }

    if (!isDynamic) {
      const price = Number(form.price);
      if (!form.title.trim()) nextErrors.title = "العنوان مطلوب.";
      if (!form.city.trim()) nextErrors.city = "المدينة مطلوبة.";
      if (!Number.isFinite(price) || price <= 0) {
        nextErrors.price = "اكتب سعراً صحيحاً.";
      }
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setCreateError("أكمل الحقول المطلوبة للقسم المختار.");
      return;
    }

    const price = Number(formData.get("price") ?? form.price);
    const title = isDynamic ? parsed.title : form.title.trim();
    const city = isDynamic ? parsed.city : form.city;
    const description = String(
      formData.get("description") ?? form.description,
    ).trim();
    const contactPhone = String(
      formData.get("contact") ?? form.contactPhone,
    ).trim();

    setCreating(true);
    setCreateError("");
    try {
      const response = await adminFetch("/api/admin/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          create: {
            title,
            description,
            categoryId: form.categoryId,
            city,
            emirate: parsed.emirate,
            area:
              typeof parsed.categorySpecs.community === "string"
                ? parsed.categorySpecs.community
                : undefined,
            price,
            condition: parsed.condition,
            status: form.status,
            isFeatured: form.isFeatured,
            isUrgent: form.isUrgent,
            sellerName: form.sellerName.trim() || undefined,
            contactPhone: contactPhone || undefined,
            categorySpecs: isDynamic ? parsed.categorySpecs : undefined,
            features: parsed.features.length > 0 ? parsed.features : undefined,
            negotiable: parsed.negotiable,
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
        status: current.status,
      }));
      setFieldErrors({});
      setFormKey((key) => key + 1);
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
        <p className="mt-2 text-xs text-muted">
          عند اختيار القسم تظهر حقوله الخاصة (مثل الغرف والحمامات للعقارات، أو
          العداد والماركة للسيارات) بنفس منطق صفحة إضافة الإعلان.
        </p>

        <form className="mt-4 grid gap-4" key={formKey} onSubmit={handleCreate}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="القسم"
              name="categoryId"
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  categoryId: event.target.value,
                }));
                setFieldErrors({});
                setCreateError("");
              }}
              options={
                categoryOptions.length > 0
                  ? categoryOptions
                  : [{ label: "جاري التحميل...", value: "" }]
              }
              value={form.categoryId}
            />
            <Select
              label="حالة النشر"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              options={publishStatusOptions}
              value={form.status}
            />
          </div>

          {fieldErrors.category ? (
            <FormMessage variant="error">
              {String(fieldErrors.category)}
            </FormMessage>
          ) : null}

          {isDynamic ? (
            <CategoryFieldsForm
              categoryId={form.categoryId}
              errors={fieldErrors}
              heading="تفاصيل القسم"
              showContact
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="عنوان الإعلان"
                name="title"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="مثال: طقم كنب مودرن"
                value={form.title}
              />
              <Input
                label="السعر (د.إ)"
                inputMode="numeric"
                name="price"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="85000"
                value={form.price}
              />
              <Select
                label="المدينة"
                name="city"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
                options={cities.map((city) => ({
                  label: city.name,
                  value: city.name,
                }))}
                value={form.city}
              />
              <Select
                label="الحالة"
                name="condition"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    condition: event.target.value,
                  }))
                }
                options={conditionOptions}
                value={form.condition}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="الوصف"
                  name="description"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="تفاصيل تظهر في صفحة الإعلان"
                  rows={3}
                  value={form.description}
                />
              </div>
            </div>
          )}

          <Input
            label="اسم البائع (اختياري)"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sellerName: event.target.value,
              }))
            }
            placeholder="إدارة سوقنا"
            value={form.sellerName}
          />

          <div className="flex flex-wrap gap-4 text-sm text-ink">
            <label className="inline-flex items-center gap-2">
              <input
                checked={form.isFeatured}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isFeatured: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              مميز
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                checked={form.isUrgent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isUrgent: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              عاجل
            </label>
          </div>

          {createError ? (
            <p className="text-sm font-medium text-error">{createError}</p>
          ) : null}

          <div>
            <Button loading={creating} type="submit" variant="primary">
              نشر الإعلان
            </Button>
          </div>
        </form>
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
                  onClick={() => patchListing(listing.id, { status: "active" })}
                  size="sm"
                  variant="primary"
                >
                  اعتماد
                </Button>
              ) : null}
              {listing.status !== "rejected" ? (
                <Button
                  loading={busyId === listing.id}
                  onClick={() => {
                    const reason = window.prompt("سبب الرفض (اختياري)")?.trim();
                    void patchListing(listing.id, {
                      status: "rejected",
                      rejectReason: reason || undefined,
                    });
                  }}
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
              <Button
                href={`/listings/${listing.slug}`}
                size="sm"
                variant="ghost"
              >
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
