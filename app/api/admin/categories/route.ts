import { NextResponse } from "next/server";
import {
  createCategoryRecord,
  getAdminCategoryRecords,
} from "@/services/categories/category-store";
import type { AdminCategoryCreateInput } from "@/types";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }
  return NextResponse.json({ categories: await getAdminCategoryRecords() });
}

export async function POST(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const body = (await request.json()) as AdminCategoryCreateInput;
  if (!body?.name?.trim() || !body?.slug?.trim()) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const category = await createCategoryRecord({
    name: body.name,
    slug: body.slug,
    icon: body.icon,
  });

  return NextResponse.json({ category }, { status: 201 });
}
