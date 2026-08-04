import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import {
  getWalletForUser,
  listWalletTransactions,
  listWallets,
} from "@/services/payments/wallet-service";
import { listPayouts, requestPayout, reviewPayout } from "@/services/payments/payout-service";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requirePermission(PERMISSIONS.WALLET_OWN);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "mine";

    if (view === "all" && canManageFinance(user)) {
      return NextResponse.json({ success: true, data: listWallets(), error: null });
    }
    if (view === "payouts") {
      const instructorId = canManageFinance(user)
        ? searchParams.get("instructorId") ?? undefined
        : user.id;
      return NextResponse.json({
        success: true,
        data: listPayouts({ instructorId }),
        error: null,
      });
    }
    if (view === "transactions") {
      const instructorId = canManageFinance(user)
        ? searchParams.get("instructorId") ?? user.id
        : user.id;
      return NextResponse.json({
        success: true,
        data: {
          wallet: getWalletForUser(user, instructorId),
          transactions: listWalletTransactions(instructorId),
        },
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: getWalletForUser(user),
      error: null,
    });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requirePermission(PERMISSIONS.WALLET_OWN);
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      amount?: number;
      methodSummary?: string;
      payoutId?: string;
      decision?: "review" | "approve" | "reject" | "paid";
      notes?: string;
    } | null;

    if (body?.action === "request_payout") {
      const payout = await requestPayout({
        user,
        amount: Number(body.amount ?? 0),
        methodSummary: body.methodSummary,
      });
      return NextResponse.json({ success: true, data: payout, error: null });
    }

    if (body?.action === "review_payout" && body.payoutId && body.decision) {
      await requirePermission(PERMISSIONS.FINANCE_WALLETS);
      const payout = await reviewPayout({
        user,
        payoutId: body.payoutId,
        decision: body.decision,
        notes: body.notes,
      });
      return NextResponse.json({ success: true, data: payout, error: null });
    }

    return NextResponse.json(
      { success: false, data: null, error: "action required" },
      { status: 400 },
    );
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
