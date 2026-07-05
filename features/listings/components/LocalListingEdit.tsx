"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { cities } from "@/shared/constants/locations";
import type { Listing, ListingCondition } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import {
  getLocalListingById,
  saveLocalListing,
} from "@/services/storage";

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
        icon="search"
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
    <Card className="p-6">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <Input defaultValue={currentListing.title} label="عنوان الإعلان" name="title" />

        <Textarea
          defaultValue={currentListing.description}
          label="الوصف"
          name="description"
        />

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
          <FormMessage variant={saveMessage.includes("نجاح") ? "success" : "error"}>
            {saveMessage}
          </FormMessage>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit">حفظ التعديلات</Button>
          <Button
            href={`/listings/local/${currentListing.id}`}
            variant="secondary"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Card>
  );
}
