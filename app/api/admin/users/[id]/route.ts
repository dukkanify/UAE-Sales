import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { toAdminUserRecord, updateUserAdmin } from "@/services/auth/user-store";
import { getAllListings } from "@/services/listings/listing-store";
import type { AdminUserPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminUserPatch;
  const user = await updateUserAdmin(id, body);

  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const listings = await getAllListings();
  const listingsCount = listings.filter((item) => item.seller.id === id).length;

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "user_update",
    targetType: "user",
    targetId: id,
    detail: [
      body.accountStatus ? `حالة ${body.accountStatus}` : null,
      typeof body.isVerified === "boolean"
        ? body.isVerified
          ? "توثيق"
          : "إلغاء توثيق"
        : null,
      body.role ? `دور ${body.role}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  return NextResponse.json({ user: toAdminUserRecord(user, listingsCount) });
}
