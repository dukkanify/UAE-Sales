import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import {
  getInstallmentPlan,
  listInstallmentPlans,
  listScheduleForPlan,
  resumePackageService,
  suspendPackageService,
} from "@/services/payments/installment-service";
import { processInstallmentReminders } from "@/services/payments/installment-reminder-service";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (planId) {
      const plan = getInstallmentPlan(planId);
      if (!plan) {
        return NextResponse.json(
          { success: false, data: null, error: "Plan not found" },
          { status: 404 },
        );
      }
      if (!canManageFinance(user) && plan.studentId !== user.id) {
        await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      }
      return NextResponse.json({
        success: true,
        data: { plan, schedule: listScheduleForPlan(planId) },
        error: null,
      });
    }

    const plans = canManageFinance(user) ? listInstallmentPlans() : listInstallmentPlans(user.id);

    return NextResponse.json({
      success: true,
      data: plans.map((plan) => ({
        plan,
        schedule: listScheduleForPlan(plan.id),
      })),
      error: null,
    });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      planId?: string;
      reason?: string;
    } | null;

    if (body?.action === "process_reminders") {
      await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      const result = await processInstallmentReminders();
      return NextResponse.json({ success: true, data: result, error: null });
    }

    if (!body?.planId) {
      return NextResponse.json(
        { success: false, data: null, error: "planId required" },
        { status: 400 },
      );
    }

    const plan = getInstallmentPlan(body.planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, data: null, error: "Plan not found" },
        { status: 404 },
      );
    }

    if (body.action === "suspend") {
      await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      const updated = await suspendPackageService({
        planId: body.planId,
        actorId: user.id,
        reason: body.reason,
      });
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    if (body.action === "resume") {
      await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      const updated = await resumePackageService({
        planId: body.planId,
        actorId: user.id,
      });
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
