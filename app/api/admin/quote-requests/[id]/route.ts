import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { updateQuoteRequestStatus } from "@/services/quote-requests/quote-request-store";
import type { QuoteRequest } from "@/types/domain/quote-request";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED: QuoteRequest["status"][] = ["submitted", "quoted", "accepted"];

export async function PATCH(request: Request, { params }: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: QuoteRequest["status"];
    actorId?: string;
    actorName?: string;
  };

  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const quoteRequest = await updateQuoteRequestStatus(id, body.status);
  if (!quoteRequest) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: body.actorId ?? "admin",
    actorName: body.actorName ?? "Admin",
    action: "quote_status",
    targetType: "quote_request",
    targetId: id,
    detail: `الحالة → ${body.status}`,
  });

  return NextResponse.json({ quoteRequest });
}
