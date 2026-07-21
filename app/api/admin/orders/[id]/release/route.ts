import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { adminReleaseEscrow } from "@/services/payments/order-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      actorId?: string;
      actorName?: string;
    };

    const order = await adminReleaseEscrow(id, "admin");
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    await logAdminAction({
      actorId: body.actorId ?? "admin",
      actorName: body.actorName ?? "Admin",
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
