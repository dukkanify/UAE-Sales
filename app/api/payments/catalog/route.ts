import { NextResponse } from "next/server";

import { requireAuth, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import {
  createCoupon,
  getPaymentSettings,
  listCoupons,
  listProducts,
  updatePaymentSettings,
  upsertProduct,
  validateCoupon,
} from "@/services/payments/catalog-service";
import { paymentErrorResponse } from "@/app/api/payments/_utils";
import type { CouponType, PricingModel } from "@/types/payments";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "products";
    if (view === "settings") {
      await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      return NextResponse.json({
        success: true,
        data: getPaymentSettings(),
        error: null,
      });
    }
    if (view === "coupons") {
      await requirePermission(PERMISSIONS.FINANCE_REPORTS);
      return NextResponse.json({ success: true, data: listCoupons(), error: null });
    }
    if (view === "validate_coupon") {
      await requireAuth();
      const code = searchParams.get("code") ?? "";
      const subtotal = Number(searchParams.get("subtotal") ?? 0);
      const courseId = searchParams.get("courseId");
      const user = await requireAuth();
      const result = validateCoupon({
        code,
        userId: user.id,
        subtotalAmount: subtotal,
        courseId,
      });
      return NextResponse.json({ success: true, data: result, error: null });
    }
    return NextResponse.json({
      success: true,
      data: listProducts({ activeOnly: searchParams.get("active") === "1" }),
      error: null,
    });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (body?.action === "settings") {
      return NextResponse.json({
        success: true,
        data: updatePaymentSettings(user, body.patch as never),
        error: null,
      });
    }

    if (body?.action === "coupon") {
      const coupon = await createCoupon(user, {
        code: String(body.code ?? ""),
        type: (body.type as CouponType) ?? "percent",
        value: Number(body.value ?? 0),
        courseId: (body.courseId as string | null) ?? null,
        maxUses: (body.maxUses as number | null) ?? null,
        minPurchaseAmount: Number(body.minPurchaseAmount ?? 0),
        maxDiscountAmount: (body.maxDiscountAmount as number | null) ?? null,
        expiresAt: (body.expiresAt as string | null) ?? null,
      });
      return NextResponse.json({ success: true, data: coupon, error: null });
    }

    const product = upsertProduct(user, {
      id: body?.id ? String(body.id) : undefined,
      name: String(body?.name ?? "Product"),
      description: String(body?.description ?? ""),
      pricingModel: (body?.pricingModel as PricingModel) ?? "one_time",
      courseId: (body?.courseId as string | null) ?? null,
      instructorId: (body?.instructorId as string | null) ?? null,
      priceAmount: Number(body?.priceAmount ?? 0),
      compareAtAmount: (body?.compareAtAmount as number | null) ?? null,
      isFree: Boolean(body?.isFree),
      active: body?.active !== false,
    });
    return NextResponse.json({ success: true, data: product, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
