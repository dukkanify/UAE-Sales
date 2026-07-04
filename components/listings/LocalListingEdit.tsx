"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { cities } from "@/constants/locations";
import type { Listing, ListingCondition } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  getLocalListingById,
  saveLocalListing,
} from "@/services/clientStorage";

type LocalListingEditProps = {
  listingId: string;
};

export function LocalListingEdit({ listingId }: LocalListingEditProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setListing(getLocalListingById(listingId) ?? null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [listingId]);

  if (!listing) {
    return (
      <EmptyState
        actionHref="/dashboard/listings"
        actionLabel="العودة إلى إعلاناتي"
        description="الإعلان غير موجود في هذا المتصفح. ربما تم حذفه أو لم يُحفظ بعد."
        icon="🔍"
        title="الإعلان غير موجود"
      />
    );
  }

  const currentListing = listing;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price") ?? 0);
    const condition = String(
      formData.get("condition") ?? currentListing.condition,
    ) as ListingCondition;
    const cityId = String(formData.get("city") ?? "dubai");

    if (title.length < 8 || description.length < 20 || price <= 0) {
      setSaveMessage("تأكد من صحة العنوان والوصف والسعر قبل الحفظ.");
      return;
    }

    const updatedListing: Listing = {
      ...currentListing,
      title,
      description,
      price,
      condition,
      city: cities.find((city) => city.id === cityId)?.name ?? currentListing.city,
    };

    saveLocalListing(updatedListing);
    setSaveMessage("تم حفظ التعديلات بنجاح.");
    router.push(`/listings/local/${currentListing.id}`);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-[linear-gradient(135deg,#fff8ed,#fffdf8)] p-6">
        <div className="uae-flag-strip mb-4 h-1.5 w-24 rounded-full" />
        <h1 className="text-3xl font-black text-ink">تعديل الإعلان</h1>
        <p className="mt-3 leading-8 text-muted">
          عدّل بيانات إعلانك المحفوظ محلياً. التغييرات ستظهر فوراً في إعلاناتي ونتائج البحث.
        </p>
      </div>

      <form className="grid gap-5 p-6" onSubmit={handleSubmit}>
        <Input defaultValue={currentListing.title} label="عنوان الإعلان" name="title" />

        <label className="grid gap-2 text-sm font-black text-ink">
          <span>الوصف</span>
          <textarea
            className="focus-ring min-h-36 rounded-2xl border border-border bg-white/90 p-4 text-sm font-bold text-ink shadow-sm"
            defaultValue={currentListing.description}
            name="description"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            defaultValue={currentListing.price}
            inputMode="numeric"
            label="السعر بالدرهم"
            min="1"
            name="price"
            type="number"
          />
          <Select
            defaultValue={currentListing.condition}
            label="حالة المنتج"
            name="condition"
            options={[
              { label: "جديد", value: "new" },
              { label: "مستعمل", value: "used" },
              { label: "ممتاز", value: "excellent" },
            ]}
          />
          <Select
            defaultValue={cities.find((city) => city.name === currentListing.city)?.id}
            label="الإمارة / المدينة"
            name="city"
            options={cities.map((city) => ({
              label: city.name,
              value: city.id,
            }))}
          />
        </div>

        {saveMessage ? (
          <div className="rounded-2xl border border-secondary/30 bg-secondary-soft p-4 text-sm font-black text-primary">
            {saveMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit">حفظ التعديلات</Button>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-black text-ink transition hover:border-primary hover:text-primary"
            href={`/listings/local/${currentListing.id}`}
          >
            إلغاء
          </Link>
        </div>
      </form>
    </Card>
  );
}
