import { NextResponse } from "next/server";
import { patchCategoryRecord } from "@/services/categories/category-store";
import type { AdminCategoryPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminCategoryPatch;
  const category = await patchCategoryRecord(id, body);

  if (!category) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ category });
}
