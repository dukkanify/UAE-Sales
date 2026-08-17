import { getAllOrders } from "@/services/payments/order-store";

export async function getEscrowTransactions() {
  const orders = await getAllOrders();
  return orders
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
}

export async function getEscrowSummary() {
  const orders = await getAllOrders();
  const held = orders.filter((order) => order.escrowStatus === "held");

  return {
    activeHolds: held.length,
    totalProtected: held.reduce((sum, order) => sum + order.fees.productPrice, 0),
    currency: "AED" as const,
  };
}
