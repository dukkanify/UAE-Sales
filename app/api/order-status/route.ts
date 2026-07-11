import { NextResponse } from "next/server";
import { verifyGuestOrderAccessToken } from "@/services/auth/token.service";
import { getAllOrders } from "@/services/payments/order-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
  }

  const orders = await getAllOrders();
  const order = orders.find((item) =>
    verifyGuestOrderAccessToken(
      token,
      item.guestAccessTokenHash,
      item.guestAccessExpiresAt,
    ),
  );

  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  const safeOrder = {
    id: order.id,
    listingTitle: order.listingTitle,
    listingSlug: order.listingSlug,
    buyerName: order.buyerName,
    buyerEmail: order.buyerEmail,
    sellerName: order.sellerName,
    status: order.status,
    escrowStatus: order.escrowStatus,
    paymentStatus: order.paymentStatus,
    fees: order.fees,
    shippingMethod: order.shippingMethod,
    deliveryAddressSnapshot: order.deliveryAddressSnapshot,
    hasExistingAccount: order.hasExistingAccount,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  };

  return NextResponse.json({ order: safeOrder });
}
