import { cities } from "@/shared/constants/locations";
import type { Listing } from "@/types";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import type { CategoryFieldErrors } from "./add-listing/CategoryFieldsForm";

type GenericListingFieldsProps = {
  errors: CategoryFieldErrors;
  listing: Listing;
};

export function GenericListingFields({ errors, listing }: GenericListingFieldsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-black text-ink">تفاصيل الإعلان</h2>
      <div className="mt-5 grid gap-4">
        <div>
          <Input
            defaultValue={listing.title}
            label="عنوان الإعلان"
            name="title"
            placeholder="مثال: آيفون 15 برو بحالة ممتازة"
            required
          />
          {errors.title ? (
            <FormMessage variant="error">{errors.title}</FormMessage>
          ) : null}
        </div>

        <Textarea
          defaultValue={listing.description}
          label="الوصف"
          name="description"
          required
        />
        {errors.description ? (
          <FormMessage variant="error">{errors.description}</FormMessage>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Input
              defaultValue={listing.price}
              inputMode="numeric"
              label="السعر بالدرهم"
              min="1"
              name="price"
              required
              type="number"
            />
            {errors.price ? (
              <FormMessage variant="error">{errors.price}</FormMessage>
            ) : null}
          </div>
          <Select
            defaultValue={listing.condition}
            label="حالة المنتج"
            name="condition"
            options={[
              { label: "جديد", value: "new" },
              { label: "مستعمل", value: "used" },
              { label: "ممتاز", value: "excellent" },
            ]}
          />
          <Select
            defaultValue={cities.find((city) => city.name === listing.city)?.id}
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
  );
}
