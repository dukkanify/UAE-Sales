import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import {
  allowedCheckoutModes,
  getRegionalPaymentRule,
  listRegionalPaymentRules,
  upsertRegionalPaymentRule,
} from "@/services/payments/regional-rules-service";
import { readPaymentsDb } from "@/services/payments/store";
import type { BnplProvider } from "@/types/payments";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") ?? user.countryCode ?? "XX";
    const rule = getRegionalPaymentRule(country);
    const settings = readPaymentsDb().settings;

    if (searchParams.get("view") === "all") {
      if (!canManageFinance(user)) await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      return NextResponse.json({
        success: true,
        data: { rules: listRegionalPaymentRules(), settings },
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        rule,
        modes: allowedCheckoutModes(rule),
        agreementVersion: settings.agreementVersion,
        agreementText: settings.agreementText,
        defaultInstallmentCount: settings.defaultInstallmentCount,
      },
      error: null,
    });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    ensurePaymentsSeeded();
    await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
    const body = (await request.json().catch(() => null)) as {
      countryCode?: string;
      countryName?: string;
      allowFullPayment?: boolean;
      allowInstallments?: boolean;
      bnplProviders?: BnplProvider[];
      maxInstallments?: number;
      minAmount?: number;
      requiresPassport?: boolean;
      requiresAgreement?: boolean;
      active?: boolean;
      notes?: string | null;
      currency?: string;
    } | null;

    if (!body?.countryCode || !body.countryName) {
      return NextResponse.json(
        { success: false, data: null, error: "countryCode and countryName required" },
        { status: 400 },
      );
    }

    const rule = upsertRegionalPaymentRule({
      countryCode: body.countryCode,
      countryName: body.countryName,
      allowFullPayment: body.allowFullPayment,
      allowInstallments: body.allowInstallments,
      bnplProviders: body.bnplProviders,
      maxInstallments: body.maxInstallments,
      minAmount: body.minAmount,
      requiresPassport: body.requiresPassport,
      requiresAgreement: body.requiresAgreement,
      active: body.active,
      notes: body.notes,
      currency: body.currency,
    });

    return NextResponse.json({ success: true, data: rule, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
