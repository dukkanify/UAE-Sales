"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { cities, countries } from "@/constants/locations";
import type { Category, Listing, ListingCondition } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Icon } from "@/components/ui/Icon";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
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

const conditionLabels: Record<ListingCondition, string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export function AddListingForm({ categories }: AddListingFormProps) {
  const [errors, setErrors] = useState<AddListingErrors>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [preview, setPreview] = useState({
    city: "دبي",
    condition: "used" as ListingCondition,
    description: "سيظهر وصف الإعلان هنا أثناء الكتابة.",
    price: "2500",
    title: "عنوان إعلانك المميز",
  });
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

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  function handleImageChange(fileList: FileList | null) {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    if (!fileList || fileList.length === 0) {
      setImagePreviews([]);
      return;
    }

    const nextPreviews = Array.from(fileList)
      .slice(0, 6)
      .map((file) => URL.createObjectURL(file));

    setImagePreviews(nextPreviews);
  }

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
    const categoryId = String(formData.get("categoryId") ?? selectedCategoryId);
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
      imageUrl: imagePreviews[0],
      seller: {
        id: user.id,
        name: user.fullName,
        rating: 4.8,
      },
      imageTone: "gold",
    };

    saveLocalListing(listing);
    router.push(`/listings/local/${id}`);
  }

  if (!isAllowed) {
    return (
      <Card className="overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-black text-ink">يلزم تسجيل الدخول</h1>
        <p className="mt-3 text-muted">
          سيتم توجيهك لتسجيل الدخول قبل إضافة إعلان جديد.
        </p>
      </Card>
    );
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_22rem]" noValidate onSubmit={handleSubmit}>
      <input name="categoryId" type="hidden" value={selectedCategoryId} />

      <div className="grid gap-6">
        <Card className="p-5" variant="flat">
          <div className="grid gap-3 sm:grid-cols-4">
            {["القسم", "التفاصيل", "الصور", "النشر"].map((step, index) => (
              <div key={step} className="rounded-[var(--radius-xl)] border border-border bg-surface-muted p-3">
                <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-primary text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-black text-ink">1. اختر القسم</h2>
          <p className="mt-2 text-sm font-medium text-muted">
            اختر القسم الأنسب لإعلانك ليظهر أمام المشترين المناسبين.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId;

              return (
                <button
                  key={category.id}
                  className={`rounded-[var(--radius-xl)] border p-4 text-center transition ${
                    isSelected
                      ? "border-secondary bg-secondary-soft shadow-[var(--shadow-xs)]"
                      : "border-border bg-surface hover:border-secondary/40"
                  }`}
                  onClick={() => setSelectedCategoryId(category.id)}
                  type="button"
                >
                  <span className="mx-auto grid size-10 place-items-center text-secondary" aria-hidden>
                    <CategoryIcon category={category} size={22} />
                  </span>
                  <p className="mt-2 text-sm font-semibold text-ink">{category.name}</p>
                </button>
              );
            })}
          </div>
          {errors.category ? (
            <FormMessage variant="error">{errors.category}</FormMessage>
          ) : null}

          {(selectedCategory?.subcategories.length ?? 0) > 0 ? (
            <div className="mt-5">
              <Select
                label="القسم الفرعي (اختياري)"
                name="subcategory"
                options={(selectedCategory?.subcategories ?? []).map((subcategory) => ({
                  label: subcategory,
                  value: subcategory,
                }))}
              />
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-black text-ink">2. تفاصيل الإعلان</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <Input
                label="عنوان الإعلان"
                name="title"
                onChange={(event) =>
                  setPreview((current) => ({
                    ...current,
                    title: event.target.value || "عنوان إعلانك المميز",
                  }))
                }
                placeholder="مثال: آيفون 15 برو بحالة ممتازة"
              />
              {errors.title ? (
                <FormMessage variant="error">{errors.title}</FormMessage>
              ) : null}
            </div>

            <Textarea
              label="الوصف"
              name="description"
              onChange={(event) =>
                setPreview((current) => ({
                  ...current,
                  description:
                    event.target.value || "سيظهر وصف الإعلان هنا أثناء الكتابة.",
                }))
              }
              placeholder="اكتب تفاصيل المنتج، الحالة، سبب البيع، وأي معلومات مهمة..."
            />
            {errors.description ? (
              <FormMessage variant="error">{errors.description}</FormMessage>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Input
                  inputMode="numeric"
                  label="السعر بالدرهم"
                  min="1"
                  name="price"
                  onChange={(event) =>
                    setPreview((current) => ({
                      ...current,
                      price: event.target.value || "2500",
                    }))
                  }
                  placeholder="2500"
                  type="number"
                />
                {errors.price ? (
                  <FormMessage variant="error">{errors.price}</FormMessage>
                ) : null}
              </div>
              <Select
                label="حالة المنتج"
                name="condition"
                onChange={(event) =>
                  setPreview((current) => ({
                    ...current,
                    condition: event.target.value as ListingCondition,
                  }))
                }
                options={[
                  { label: "جديد", value: "new" },
                  { label: "مستعمل", value: "used" },
                  { label: "ممتاز", value: "excellent" },
                ]}
              />
              <Select
                label="الإمارة / المدينة"
                name="city"
                onChange={(event) =>
                  setPreview((current) => ({
                    ...current,
                    city:
                      cities.find((city) => city.id === event.target.value)?.name ??
                      "دبي",
                  }))
                }
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
            <div className="grid gap-3">
              <label className="grid min-h-40 cursor-pointer place-items-center rounded-[var(--radius-2xl)] border border-dashed border-secondary bg-secondary-soft p-6 text-center text-sm font-semibold text-primary transition hover:bg-secondary/20">
                <input
                  accept="image/*"
                  className="sr-only"
                  multiple
                  onChange={(event) => handleImageChange(event.target.files)}
                  type="file"
                />
                <span>
                  رفع صور الإعلان
                  <span className="mt-2 block text-xs font-medium text-muted">
                    {imagePreviews.length > 0
                      ? `تم اختيار ${imagePreviews.length} صورة`
                      : "اختر حتى 6 صور — ستظهر في المعاينة"}
                  </span>
                </span>
              </label>
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((url, index) => (
                    <div
                      key={url}
                      className="relative h-20 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
                    >
                      <div
                        aria-label={`معاينة صورة ${index + 1}`}
                        className="absolute inset-0 bg-cover bg-center"
                        role="img"
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-4">
              <div>
                <Input
                  label="رقم التواصل"
                  name="contact"
                  placeholder="05xxxxxxxx"
                  type="tel"
                />
                {errors.contact ? (
                  <FormMessage variant="error">{errors.contact}</FormMessage>
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

        <Card className="flex flex-wrap items-center justify-between gap-4 bg-primary p-5 text-white">
          <p className="font-medium">
            بعد النشر سيظهر الإعلان في إعلاناتي، صفحة القسم، ونتائج البحث.
          </p>
          <Button className="shrink-0" type="submit">
            نشر الإعلان
          </Button>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Card className="p-5">
          <p className="text-sm font-semibold text-muted">معاينة الإعلان</p>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted">
            <div className="relative h-44">
              {imagePreviews[0] ? (
                <div
                  aria-label="معاينة صورة الإعلان"
                  className="absolute inset-0 bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${imagePreviews[0]})` }}
                />
              ) : (
                <div className="grid h-full place-items-center text-secondary">
                  {selectedCategory ? (
                    <CategoryIcon category={selectedCategory} size={36} />
                  ) : (
                    <Icon name="package" size={36} />
                  )}
                </div>
              )}
              <span className="absolute start-4 top-4 rounded-[var(--radius-lg)] bg-surface/90 px-3 py-1 text-xs font-semibold text-primary">
                {selectedCategory?.name ?? "قسم"}
              </span>
            </div>
            <div className="bg-surface p-5">
              <h3 className="line-clamp-2 text-lg font-semibold leading-8 text-ink">
                {preview.title}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm font-medium leading-7 text-muted">
                {preview.description}
              </p>
              <div className="mt-4 flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
                <span className="text-lg font-semibold text-accent">
                  {Number(preview.price || 0).toLocaleString("ar-AE")} د.إ
                </span>
                <span className="text-sm font-medium text-muted">{preview.city}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted">
                <span>{conditionLabels[preview.condition]}</span>
                <span>{imagePreviews.length} صور</span>
              </div>
            </div>
          </div>
        </Card>
      </aside>
    </form>
  );
}
