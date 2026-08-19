import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireSessionUser } from "@/services/auth/require-session";
import { notifyQuoteRequestStatusChanged } from "@/services/notifications/notification-events";
import {
  getQuoteRequestById,
  updateQuoteRequestStatus,
} from "@/services/quote-requests/quote-request-store";
import type { QuoteRequest } from "@/types/domain/quote-request";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED: QuoteRequest["status"][] = [
  "submitted",
  "quoted",
  "accepted",
  "rejected",
  "expired",
  "converted",
];

const schema = z.object({
  status: z.enum(["submitted", "quoted", "accepted", "rejected", "expired", "converted"]),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireSessionUser();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !ALLOWED.includes(parsed.data.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const current = await getQuoteRequestById(id);
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isParty =
    session.id === current.providerId ||
    session.id === current.requesterId ||
    session.role === "admin";
  if (!isParty) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const quoteRequest = await updateQuoteRequestStatus(id, parsed.data.status);
  if (!quoteRequest) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  void notifyQuoteRequestStatusChanged(quoteRequest);
  return NextResponse.json({ quoteRequest });
}
