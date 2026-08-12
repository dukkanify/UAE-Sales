import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import {
  createCategoryRecord,
  getAdminCategoryRecords,
} from "@/services/categories/category-store";
import type { AdminCategoryCreateInput } from "@/types";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  return NextResponse.json({ categories: await getAdminCategoryRecords() });
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
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
