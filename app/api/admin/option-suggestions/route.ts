import { NextResponse } from "next/server";
import { isSessionUser } from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import {
  listOptionSuggestions,
  reviewOptionSuggestion,
} from "@/services/admin/option-suggestion-store";
import { logAdminAction } from "@/services/admin/admin-audit-store";

export async function GET(request: Request) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) return admin;

  const status = new URL(request.url).searchParams.get("status") as
    | "pending"
    | "approved"
    | "rejected"
    | null;
  const items = await listOptionSuggestions(status ?? undefined);
  return NextResponse.json({ items });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) return admin;

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: "approved" | "rejected";
  } | null;
  if (!body?.id || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const updated = await reviewOptionSuggestion({
    id: body.id,
    status: body.status,
    adminId: admin.id,
  });
  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "option_suggestion_review",
    targetType: "option_suggestion",
    targetId: updated.id,
    detail: `${body.status}: ${updated.categoryId}.${updated.fieldKey}=${updated.value}`,
  });

  return NextResponse.json({ ok: true, suggestion: updated });
}
