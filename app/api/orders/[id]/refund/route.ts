import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { refundOrder } from "@/services/payments/order-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      reason?: string;
    };

    const order = await refundOrder(id);
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    await logAdminAction({
      actorId: admin.id,
      actorName: admin.fullName,
      action: "order_refund",
      targetType: "order",
      targetId: id,
      detail: body.reason?.trim()
        ? `استرداد — ${body.reason.trim()}`
        : `استرداد — ${order.listingTitle}`,
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "UNAUTHORIZED" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
