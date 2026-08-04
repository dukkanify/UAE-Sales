import { NextResponse } from "next/server";

import { requireAuth, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import {
  cancelOrder,
  createCheckoutOrder,
  getOrder,
  listOrders,
  listPayments,
  listSubscriptions,
  listTransactionLogs,
  payOrder,
  retryPayment,
} from "@/services/payments/checkout-service";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";
import type { PaymentMethodBrand } from "@/types/payments";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "orders";

    if (view === "ledger") {
      await requirePermission(PERMISSIONS.FINANCE_REPORTS);
      return NextResponse.json({
        success: true,
        data: listTransactionLogs(200),
        error: null,
      });
    }
    if (view === "payments") {
      if (!canManageFinance(user)) await requirePermission(PERMISSIONS.BILLING_OWN);
      return NextResponse.json({
        success: true,
        data: canManageFinance(user)
          ? listPayments()
          : listPayments().filter((p) => {
              const o = getOrder(p.orderId);
              return o?.studentId === user.id;
            }),
        error: null,
      });
    }
    if (view === "subscriptions") {
      return NextResponse.json({
        success: true,
        data: listSubscriptions(canManageFinance(user) ? undefined : user.id),
        error: null,
      });
    }
    if (searchParams.get("id")) {
      const order = getOrder(searchParams.get("id")!);
      if (!order) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      if (order.studentId !== user.id && !canManageFinance(user)) {
        return NextResponse.json(
          { success: false, data: null, error: "Access denied" },
          { status: 403 },
        );
      }
      return NextResponse.json({ success: true, data: order, error: null });
    }

    const orders = canManageFinance(user)
      ? listOrders({ status: (searchParams.get("status") as never) ?? "all" })
      : listOrders({ studentId: user.id });
    return NextResponse.json({ success: true, data: orders, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requirePermission(PERMISSIONS.BILLING_OWN);
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      productId?: string;
      orderId?: string;
      billingName?: string;
      billingEmail?: string;
      billingCountry?: string;
      billingAddress?: string;
      couponCode?: string;
      idempotencyKey?: string;
      methodBrand?: PaymentMethodBrand;
      paymentToken?: string;
      simulateFailure?: boolean;
    } | null;

    if (body?.action === "checkout") {
      const order = await createCheckoutOrder({
        user,
        productId: body.productId ?? "",
        billingName: body.billingName ?? user.fullName ?? user.email,
        billingEmail: body.billingEmail ?? user.email,
        billingCountry: body.billingCountry,
        billingAddress: body.billingAddress,
        couponCode: body.couponCode,
        idempotencyKey: body.idempotencyKey,
      });
      return NextResponse.json({ success: true, data: order, error: null });
    }

    if (body?.action === "pay" && body.orderId) {
      const result = await payOrder({
        user,
        orderId: body.orderId,
        methodBrand: body.methodBrand ?? "visa",
        paymentToken: body.paymentToken,
        simulateFailure: body.simulateFailure,
      });
      return NextResponse.json({ success: true, data: result, error: null });
    }

    if (body?.action === "retry" && body.orderId) {
      const result = await retryPayment({
        user,
        orderId: body.orderId,
        methodBrand: body.methodBrand ?? "visa",
        paymentToken: body.paymentToken,
      });
      return NextResponse.json({ success: true, data: result, error: null });
    }

    if (body?.action === "cancel" && body.orderId) {
      return NextResponse.json({
        success: true,
        data: cancelOrder(user, body.orderId),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "action required" },
      { status: 400 },
    );
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
