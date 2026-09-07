import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { getOrderById } from "@/services/payments/order-store";
import {
  getBuyerEvidenceConfirmation,
  listEvidenceForOrder,
} from "@/services/payments/escrow-evidence-store";

type RouteParams = { params: Promise<{ id: string }> };

/** Seller/buyer/admin can view evidence linked to an escrow order. */
export async function GET(_request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  const isParty =
    order.sellerId === user.id ||
    order.buyerId === user.id ||
    user.role === "admin";
  if (!isParty) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const [evidence, confirmation] = await Promise.all([
    listEvidenceForOrder(id),
    getBuyerEvidenceConfirmation(id),
  ]);

  return NextResponse.json({
    orderId: id,
    transactionId: order.stripePaymentIntentId ?? order.id,
    evidence,
    confirmation,
  });
}
