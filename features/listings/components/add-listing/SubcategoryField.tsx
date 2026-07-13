import { Select } from "@/shared/ui/Select";

type SubcategoryFieldProps = {
  subcategories: string[];
};

export function SubcategoryField({ subcategories }: SubcategoryFieldProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <Select
      label="القسم الفرعي (اختياري)"
      name="subcategory"
      options={subcategories.map((subcategory) => ({
        label: subcategory,
        value: subcategory,
      }))}
    />
  );
}
