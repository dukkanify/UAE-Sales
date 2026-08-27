import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { approvePendingUser } from "@/services/auth/signup-approval";
import {
  findUserById,
  toAdminUserRecord,
  updateUserAdmin,
} from "@/services/auth/user-store";
import { getAllListings } from "@/services/listings/listing-store";
import type { AdminUserPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("users");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminUserPatch;
  const current = await findUserById(id);
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const actorIsSuper =
    !admin.adminPermissions || admin.adminPermissions.length === 0;
  const targetIsSuper =
    current.role === "admin" &&
    (!current.adminPermissions || current.adminPermissions.length === 0);

  // Sub-admins cannot modify super admins.
  if (!actorIsSuper && targetIsSuper) {
    return NextResponse.json({ error: "CANNOT_MODIFY_SUPER_ADMIN" }, { status: 403 });
  }

  // Prevent self-escalation to full super admin or broader modules.
  if (admin.id === id && body.adminPermissions) {
    const currentPerms = new Set(admin.adminPermissions ?? []);
    const nextPerms = body.adminPermissions;
    const expandingToSuper = nextPerms.length === 0 && currentPerms.size > 0;
    const addingModules = nextPerms.some((item) => !currentPerms.has(item));
    if (expandingToSuper || (currentPerms.size > 0 && addingModules)) {
      return NextResponse.json({ error: "SELF_ESCALATION" }, { status: 403 });
    }
  }

  // Only super admins may change roles or module permissions.
  if (
    !actorIsSuper &&
    (body.role !== undefined || body.adminPermissions !== undefined)
  ) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (body.accountStatus === "active" && current.accountStatus === "pending") {
    if (!current.emailVerifiedAt) {
      return NextResponse.json(
        {
          error: "PERSON_NOT_VERIFIED",
          message: "تحقق من الشخص أولاً قبل اعتماد الحساب.",
        },
        { status: 400 },
      );
    }
    await approvePendingUser(id);
  }

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
      body.adminPermissions
        ? `صلاحيات: ${
            body.adminPermissions.length === 0
              ? "مدير أعلى"
              : body.adminPermissions.join(",")
          }`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  return NextResponse.json({ user: toAdminUserRecord(user, listingsCount) });
}
