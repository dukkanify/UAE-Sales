import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { getInvoice, listInvoices, renderInvoiceHtml } from "@/services/payments/invoice-service";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";

export async function GET(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id && (searchParams.get("print") === "1" || searchParams.get("format") === "html")) {
      const invoice = getInvoice(id);
      if (!invoice) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      if (invoice.studentId !== user.id && !canManageFinance(user)) {
        return NextResponse.json(
          { success: false, data: null, error: "Access denied" },
          { status: 403 },
        );
      }
      return new NextResponse(renderInvoiceHtml(id), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (id) {
      const invoice = getInvoice(id);
      if (!invoice) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      if (invoice.studentId !== user.id && !canManageFinance(user)) {
        return NextResponse.json(
          { success: false, data: null, error: "Access denied" },
          { status: 403 },
        );
      }
      return NextResponse.json({ success: true, data: invoice, error: null });
    }

    const rows = canManageFinance(user)
      ? listInvoices()
      : listInvoices({ studentId: user.id });
    return NextResponse.json({ success: true, data: rows, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
