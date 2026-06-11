"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { cities, countries } from "@/constants/locations";
import type { Category, Listing, ListingCondition } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getSessionUser, saveLocalListing } from "@/services/clientStorage";

type AddListingFormProps = {
  categories: Category[];
};

type AddListingErrors = {
  category?: string;
  contact?: string;
  description?: string;
  price?: string;
  title?: string;
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AddListingForm({ categories }: AddListingFormProps) {
  const [errors, setErrors] = useState<AddListingErrors>({});
  const [imageCount, setImageCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (getSessionUser()) {
        setIsAllowed(true);
        return;
      }

      router.replace("/login?next=/listings/new");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getSessionUser();
    if (!user) {
      router.replace("/login?next=/listings/new");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price") ?? 0);
    const categoryId = String(formData.get("categoryId") ?? "");
    const condition = String(formData.get("condition") ?? "used") as ListingCondition;
    const cityId = String(formData.get("city") ?? "dubai");
    const contact = String(formData.get("contact") ?? "").trim();
    const nextErrors: AddListingErrors = {};

    if (!categoryId) {
      nextErrors.category = "اختر القسم المناسب للإعلان.";
    }

    if (title.length < 8) {
      nextErrors.title = "عنوان الإعلان يجب أن يكون 8 أحرف على الأقل.";
    }

    if (description.length < 20) {
      nextErrors.description = "اكتب وصفاً واضحاً لا يقل عن 20 حرفاً.";
    }

    if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = "اكتب سعراً صحيحاً أكبر من صفر.";
    }

    if (!/^(\+971|971|0)?5\d{8}$/.test(contact)) {
      nextErrors.contact = "اكتب رقم تواصل إماراتي صحيح.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const id = `local-${Date.now()}`;
    const listing: Listing = {
      id,
      title,
      slug: createSlug(title) || id,
      description,
      categoryId,
      city: cities.find((city) => city.id === cityId)?.name ?? "دبي",
      country: countries[0].name,
      price,
      currency: "AED",
      condition,
      status: "active",
      isFeatured: false,
      views: 0,
      seller: {
        id: user.id,
        name: user.fullName,
        rating: 4.8,
      },
      imageTone: "emerald",
    };

    saveLocalListing(listing);
    router.push(`/listings/local/${id}`);
  }

  if (!isAllowed) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-black text-ink">يلزم تسجيل الدخول</h1>
        <p className="mt-3 text-muted">
          سيتم توجيهك لتسجيل الدخول قبل إضافة إعلان جديد.
        </p>
      </Card>
    );
  }

  return (
    <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
      <Card className="p-6">
        <h2 className="text-2xl font-black text-ink">1. اختر القسم</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <Select
              label="القسم الرئيسي"
              name="categoryId"
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              value={selectedCategoryId}
            />
            {errors.category ? (
              <p className="mt-2 text-xs font-bold text-rose-700">
                {errors.category}
              </p>
            ) : null}
          </div>
          <Select
            label="القسم الفرعي"
            name="subcategory"
            options={(selectedCategory?.subcategories ?? []).map((subcategory) => ({
              label: subcategory,
              value: subcategory,
            }))}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-black text-ink">2. تفاصيل الإعلان</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <Input
              label="عنوان الإعلان"
              name="title"
              placeholder="مثال: آيفون 15 برو بحالة ممتازة"
            />
            {errors.title ? (
              <p className="mt-2 text-xs font-bold text-rose-700">
                {errors.title}
              </p>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm font-black text-ink">
            <span>الوصف</span>
            <textarea
              className="focus-ring min-h-36 rounded-2xl border border-border bg-white/90 p-4 text-sm font-bold text-ink shadow-sm placeholder:text-muted"
              name="description"
              placeholder="اكتب تفاصيل المنتج، الحالة، سبب البيع، وأي معلومات مهمة..."
            />
          </label>
          {errors.description ? (
            <p className="-mt-2 text-xs font-bold text-rose-700">
              {errors.description}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                inputMode="numeric"
                label="السعر بالدرهم"
                min="1"
                name="price"
                placeholder="2500"
                type="number"
              />
              {errors.price ? (
                <p className="mt-2 text-xs font-bold text-rose-700">
                  {errors.price}
                </p>
              ) : null}
            </div>
            <Select
              label="حالة المنتج"
              name="condition"
              options={[
                { label: "جديد", value: "new" },
                { label: "مستعمل", value: "used" },
                { label: "ممتاز", value: "excellent" },
              ]}
            />
            <Select
              label="الإمارة / المدينة"
              name="city"
              options={cities.map((city) => ({
                label: city.name,
                value: city.id,
              }))}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-black text-ink">3. الصور والتواصل</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid min-h-40 cursor-pointer place-items-center rounded-3xl border border-dashed border-primary bg-primary-soft p-6 text-center text-sm font-black text-primary">
            <input
              className="sr-only"
              multiple
              onChange={(event) => setImageCount(event.target.files?.length ?? 0)}
              type="file"
            />
            <span>
              رفع صور الإعلان Mock Upload
              <span className="mt-2 block text-xs text-muted">
                {imageCount > 0
                  ? `تم اختيار ${imageCount} صورة`
                  : "اختر حتى 6 صور للمعاينة لاحقاً"}
              </span>
            </span>
          </label>
          <div className="grid gap-4">
            <div>
              <Input
                label="رقم التواصل"
                name="contact"
                placeholder="05xxxxxxxx"
                type="tel"
              />
              {errors.contact ? (
                <p className="mt-2 text-xs font-bold text-rose-700">
                  {errors.contact}
                </p>
              ) : null}
            </div>
            <Select
              label="باقة الإعلان"
              name="package"
              options={[
                { label: "مجانية", value: "free" },
                { label: "مميز لمدة 7 أيام", value: "featured_7" },
                { label: "مميز لمدة 30 يوم", value: "featured_30" },
              ]}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] bg-night p-5 text-white">
        <p className="font-bold">
          بعد النشر سيظهر الإعلان في إعلاناتي، صفحة القسم، ونتائج البحث.
        </p>
        <Button type="submit">نشر الإعلان</Button>
      </div>
    </form>
  );
}
