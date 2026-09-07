import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { patchCategoryRecord } from "@/services/categories/category-store";
import type { AdminCategoryPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminCategoryPatch;
  const category = await patchCategoryRecord(id, body);

  if (!category) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "category_update",
    targetType: "category",
    targetId: id,
    detail: [
      body.name ? `اسم ${body.name}` : null,
      typeof body.enabled === "boolean"
        ? body.enabled
          ? "مفعّل"
          : "معطّل"
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  return NextResponse.json({ category });
}
