import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  getAdminDisputes,
  patchAdminDispute,
} from "@/services/admin/dispute-store";
import {
  adminReleaseEscrow,
  refundOrder,
} from "@/services/payments/order-service";
import type { AdminDisputePatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminDisputePatch;

  const existing = (await getAdminDisputes()).find((row) => row.id === id);
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let financialEffect: "refunded" | "released" | "order_missing" | "skipped" =
    "skipped";

  if (
    body.status === "resolved_buyer" &&
    existing.status !== "resolved_buyer"
  ) {
    try {
      const order = await refundOrder(existing.orderId);
      financialEffect = order ? "refunded" : "order_missing";
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
      const status =
        message === "UNAUTHORIZED"
          ? 403
          : message === "INVALID_STATUS" || message === "ALREADY_REFUNDED"
            ? 400
            : 500;
      return NextResponse.json({ error: message }, { status });
    }
  }

  if (
    body.status === "resolved_seller" &&
    existing.status !== "resolved_seller"
  ) {
    try {
      const order = await adminReleaseEscrow(existing.orderId);
      financialEffect = order ? "released" : "order_missing";
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

  const dispute = await patchAdminDispute(id, body);
  if (!dispute) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "dispute_update",
    targetType: "dispute",
    targetId: id,
    detail: `حالة ${dispute.status}${
      financialEffect !== "skipped" ? ` · أثر مالي: ${financialEffect}` : ""
    }`,
  });

  return NextResponse.json({ dispute, financialEffect });
}
