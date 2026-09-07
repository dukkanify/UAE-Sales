import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAllQuoteRequests } from "@/services/quote-requests/quote-request-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  const quoteRequests = await getAllQuoteRequests();
  return NextResponse.json({ quoteRequests });
}
