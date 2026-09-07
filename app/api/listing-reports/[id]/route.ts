import { NextResponse } from "next/server";
import { getListingReportReceipt } from "@/services/listings/listing-report-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const report = await getListingReportReceipt(id, token);
  if (!report) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ report });
}
