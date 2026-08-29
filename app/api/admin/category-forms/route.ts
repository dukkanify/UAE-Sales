import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser } from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  listCategoryFormFields,
  replaceCategoryFormFields,
  seedCategoryFormFromDefaults,
} from "@/services/admin/category-form-store";
import { isDynamicCategory } from "@/shared/constants/category-fields";

const fieldSchema = z.object({
  fieldKey: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(120),
  type: z.enum([
    "text",
    "number",
    "select",
    "combobox",
    "textarea",
    "checkbox-group",
  ]),
  required: z.boolean().optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  placeholder: z.string().max(200).optional(),
  note: z.string().max(300).optional(),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  validation: z.string().max(200).optional(),
  visibility: z.string().max(200).optional(),
  showWhen: z
    .object({
      key: z.string(),
      values: z.array(z.string()),
    })
    .optional(),
  titlePart: z.boolean().optional(),
  searchable: z.boolean().optional(),
});

export async function GET(request: Request) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) return admin;

  const categoryId = new URL(request.url).searchParams.get("categoryId") ?? "";
  if (!categoryId) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  let fields = await listCategoryFormFields(categoryId);
  if (fields.length === 0 && isDynamicCategory(categoryId)) {
    fields = await seedCategoryFormFromDefaults(categoryId);
  }
  return NextResponse.json({ categoryId, fields });
}

export async function PUT(request: Request) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) return admin;

  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      categoryId: z.string().min(1),
      fields: z.array(fieldSchema).max(80),
    })
    .safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const fields = await replaceCategoryFormFields(
    parsed.data.categoryId,
    parsed.data.fields.map((field, index) => ({
      ...field,
      required: Boolean(field.required),
      enabled: field.enabled !== false,
      sortOrder: field.sortOrder ?? index,
    })),
  );

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "category_form_update",
    targetType: "category_form",
    targetId: parsed.data.categoryId,
    detail: `${fields.length} fields saved`,
  });

  return NextResponse.json({ ok: true, fields });
}
