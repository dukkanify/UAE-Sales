import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { exportFinanceCsv, getFinanceDashboard } from "@/services/payments/report-service";
import { paymentErrorResponse } from "@/app/api/payments/_utils";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requirePermission(PERMISSIONS.FINANCE_REPORTS);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const report = (searchParams.get("report") ??
      "orders") as "orders" | "payments" | "refunds" | "payouts" | "ledger" | "instructors";

    if (format === "csv") {
      const csv = exportFinanceCsv(user, report);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="finance-${report}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: getFinanceDashboard(),
      error: null,
    });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
