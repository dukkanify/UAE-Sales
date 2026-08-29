import { NextResponse } from "next/server";
import { resolveCategoryFields } from "@/services/admin/category-form-store";
import { listApprovedFieldOptions } from "@/services/admin/approved-field-options-store";
import { isDynamicCategory } from "@/shared/constants/category-fields";

/** Public resolved category fields for Add/Edit Listing (code defaults + admin overrides + approved options). */
export async function GET(request: Request) {
  const categoryId = new URL(request.url).searchParams.get("categoryId") ?? "";
  if (!categoryId || !isDynamicCategory(categoryId)) {
    return NextResponse.json({ fields: [] });
  }

  const fields = await resolveCategoryFields(categoryId);
  const approved = await listApprovedFieldOptions({ categoryId });

  const merged = fields.map((field) => {
    const extras = approved
      .filter((row) => row.fieldKey === field.key)
      .map((row) => ({ label: row.label, value: row.value }));
    if (extras.length === 0 || !field.options) return field;
    const existing = new Set(field.options.map((option) => option.value.toLowerCase()));
    const nextOptions = [
      ...field.options.filter((option) => option.value !== "other"),
      ...extras.filter((option) => !existing.has(option.value.toLowerCase())),
      ...field.options.filter((option) => option.value === "other"),
    ];
    return { ...field, options: nextOptions };
  });

  return NextResponse.json({ fields: merged });
}
