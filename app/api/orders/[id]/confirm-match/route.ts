import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { confirmBuyerMatch } from "@/services/payments/order-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  try {
    const { id } = await params;
    const order = await confirmBuyerMatch(id, user.id);
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "UNAUTHORIZED"
        ? 403
        : message === "INVALID_STATUS" || message === "PROOF_REQUIRED"
          ? 409
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
