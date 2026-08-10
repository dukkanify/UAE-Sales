import { NextResponse } from "next/server";

import { processInstallmentReminders } from "@/services/payments/installment-reminder-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { paymentErrorResponse } from "@/app/api/payments/_utils";

/** Cron-friendly processor for installment reminders + overdue suspend. */
export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const secret = process.env.CRON_SECRET || process.env.REMINDER_CRON_SECRET;
    if (secret) {
      const header = request.headers.get("x-cron-secret") || request.headers.get("authorization");
      if (header !== secret && header !== `Bearer ${secret}`) {
        return NextResponse.json(
          { success: false, data: null, error: "Unauthorized" },
          { status: 401 },
        );
      }
    }
    const result = await processInstallmentReminders();
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
