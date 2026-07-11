import { NextResponse } from "next/server";
import { getAllQuoteRequests } from "@/services/quote-requests/quote-request-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const quoteRequests = await getAllQuoteRequests();
  return NextResponse.json({ quoteRequests });
}
