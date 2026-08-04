import { NextResponse } from "next/server";

import { requireAuth, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { listRefunds, requestRefund, reviewRefund } from "@/services/payments/refund-service";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";

export async function GET() {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const rows = canManageFinance(user)
      ? listRefunds()
      : listRefunds({ studentId: user.id });
    return NextResponse.json({ success: true, data: rows, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      orderId?: string;
      amount?: number;
      reason?: string;
      refundId?: string;
      decision?: "approve" | "reject";
      adminNotes?: string;
    } | null;

    if (body?.action === "request") {
      const user = await requirePermission(PERMISSIONS.BILLING_OWN);
      const refund = await requestRefund({
        user,
        orderId: body.orderId ?? "",
        amount: body.amount,
        reason: body.reason ?? "Requested by customer",
      });
      return NextResponse.json({ success: true, data: refund, error: null });
    }

    if (body?.action === "review" && body.refundId && body.decision) {
      const user = await requirePermission(PERMISSIONS.FINANCE_REPORTS);
      const refund = await reviewRefund({
        user,
        refundId: body.refundId,
        decision: body.decision,
        adminNotes: body.adminNotes,
      });
      return NextResponse.json({ success: true, data: refund, error: null });
    }

    return NextResponse.json(
      { success: false, data: null, error: "action required" },
      { status: 400 },
    );
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
