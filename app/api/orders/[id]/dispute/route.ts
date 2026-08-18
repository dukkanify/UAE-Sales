import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { openDisputeFromOrder } from "@/services/payments/dispute-service";

type RouteParams = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  reason: z.string().min(10).max(2000),
  reasonCode: z
    .enum([
      "not_as_described",
      "not_received",
      "damaged",
      "wrong_item",
      "seller_unresponsive",
      "other",
    ])
    .optional(),
  evidenceUrls: z.array(z.string().min(1).max(2000)).max(10).optional(),
});

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const result = await openDisputeFromOrder(
      id,
      user.id,
      parsed.data.reason,
      parsed.data.evidenceUrls,
      parsed.data.reasonCode ?? "other",
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "UNAUTHORIZED"
        ? 403
        : message === "ORDER_NOT_FOUND"
          ? 404
          : message === "INVALID_STATUS" ||
              message === "DISPUTE_WINDOW_CLOSED" ||
              message === "INVALID_REASON"
            ? 409
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
