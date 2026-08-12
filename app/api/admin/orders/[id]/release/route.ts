import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { adminReleaseEscrow } from "@/services/payments/order-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  try {
    const { id } = await params;

    const order = await adminReleaseEscrow(id);
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    await logAdminAction({
      actorId: admin.id,
      actorName: admin.fullName,
      action: "escrow_release",
      targetType: "order",
      targetId: id,
      detail: `تحرير ضمان — ${order.listingTitle}`,
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "UNAUTHORIZED"
        ? 403
        : message === "INVALID_STATUS" ||
            message === "NOT_HELD" ||
            message === "ALREADY_REFUNDED"
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
