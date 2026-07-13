import type { ListingCondition } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import type { AddListingErrors, ListingPreview } from "./types";
import {
  addListingStepBodyClass,
  addListingStepCardClass,
  addListingStepTitleClass,
} from "./utils";

type ListingDetailsStepProps = {
  errors: AddListingErrors;
  onPreviewChange: (updater: (current: ListingPreview) => ListingPreview) => void;
};

export function ListingDetailsStep({
  errors,
  onPreviewChange,
}: ListingDetailsStepProps) {
  return (
    <Card className={addListingStepCardClass}>
      <h2 className={addListingStepTitleClass}>2. تفاصيل الإعلان</h2>
      <div className={addListingStepBodyClass}>
        <div>
          <Input
            label="عنوان الإعلان"
            name="title"
            onChange={(event) =>
              onPreviewChange((current) => ({
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
            onPreviewChange((current) => ({
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
                onPreviewChange((current) => ({
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
              onPreviewChange((current) => ({
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
              onPreviewChange((current) => ({
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
  );
}
