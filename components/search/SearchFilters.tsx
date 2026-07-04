import type { Category, City } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type SearchFiltersProps = {
  action?: string;
  categories: Category[];
  cities: City[];
  countries: {
    id: string;
    name: string;
  }[];
  selectedFilters: {
    category?: string;
    city?: string;
    condition?: string;
    country?: string;
    maxPrice?: string;
    minPrice?: string;
    query?: string;
    sort?: string;
  };
  showCategory?: boolean;
};

export function SearchFilters({
  action = "/search",
  categories,
  cities,
  countries,
  selectedFilters,
  showCategory = true,
}: SearchFiltersProps) {
  return (
    <Card className="p-5" variant="elevated">
      <form
        action={action}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
      >
        <Input
          defaultValue={selectedFilters.query}
          label="كلمة البحث"
          name="q"
          placeholder="سيارة، هاتف، عقار..."
        />
        <Select
          defaultValue={selectedFilters.country}
          label="الدولة"
          name="country"
          options={[
            { label: "كل الدول", value: "" },
            ...countries.map((country) => ({
              label: country.name,
              value: country.name,
            })),
          ]}
        />
        <Select
          defaultValue={selectedFilters.city}
          label="الإمارة"
          name="city"
          options={[
            { label: "كل المدن", value: "" },
            ...cities.map((city) => ({ label: city.name, value: city.name })),
          ]}
        />
        {showCategory ? (
          <Select
            defaultValue={selectedFilters.category}
            label="التصنيف"
            name="category"
            options={[
              { label: "كل التصنيفات", value: "" },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
          />
        ) : null}
        <Select
          defaultValue={selectedFilters.condition}
          label="الحالة"
          name="condition"
          options={[
            { label: "الكل", value: "" },
            { label: "جديد", value: "new" },
            { label: "مستعمل", value: "used" },
            { label: "ممتاز", value: "excellent" },
          ]}
        />
        <Input
          defaultValue={selectedFilters.minPrice}
          inputMode="numeric"
          label="أقل سعر"
          min="0"
          name="minPrice"
          placeholder="0"
          type="number"
        />
        <Input
          defaultValue={selectedFilters.maxPrice}
          inputMode="numeric"
          label="أعلى سعر"
          min="0"
          name="maxPrice"
          placeholder="50000"
          type="number"
        />
        <div className="grid gap-2">
          <Select
            defaultValue={selectedFilters.sort}
            label="الترتيب"
            name="sort"
            options={[
              { label: "الأحدث", value: "newest" },
              { label: "السعر ↑", value: "price_asc" },
              { label: "السعر ↓", value: "price_desc" },
            ]}
          />
          <Button className="mt-auto w-full" type="submit" variant="primary">
            تطبيق
          </Button>
        </div>
      </form>
    </Card>
  );
}
