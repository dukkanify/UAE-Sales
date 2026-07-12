import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import {
  canUserAccessOrder,
  toAuthorizedOrderView,
} from "@/services/payments/order-access";
import { getOrderById } from "@/services/payments/order-store";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  const user = await getSessionFromCookie();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!canUserAccessOrder(user, order)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  return NextResponse.json({ order: toAuthorizedOrderView(order, user) });
}
