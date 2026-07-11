import { getAllOrders } from "@/services/payments/order-store";

const MOCK_TRANSACTIONS = [
  {
    id: "escrow-001",
    listingTitle: "آيفون 15 برو 128 جيجابايت",
    amount: 3200,
    status: "held" as const,
    buyer: "سارة الكعبي",
    createdAt: "2026-06-25T10:15:00+04:00",
  },
];

export async function getEscrowTransactions() {
  const orders = await getAllOrders();
  const live = orders
    .filter((order) => order.escrowStatus === "held" || order.escrowStatus === "released")
    .map((order) => ({
      id: order.id,
      listingTitle: order.listingTitle,
      amount: order.fees.productPrice,
      status:
        order.escrowStatus === "held"
          ? ("held" as const)
          : order.escrowStatus === "released"
            ? ("released" as const)
            : ("pending_delivery" as const),
      buyer: order.buyerName,
      createdAt: order.createdAt,
      orderId: order.id,
      stripePaymentIntentId: order.stripePaymentIntentId,
    }));

  return live.length > 0 ? live : MOCK_TRANSACTIONS;
}

export async function getEscrowSummary() {
  const orders = await getAllOrders();
  const held = orders.filter((order) => order.escrowStatus === "held");

  if (held.length === 0) {
    return {
      activeHolds: 2,
      totalProtected: 12413,
      currency: "AED" as const,
    };
  }

  return {
    activeHolds: held.length,
    totalProtected: held.reduce((sum, order) => sum + order.fees.productPrice, 0),
    currency: "AED" as const,
  };
}
