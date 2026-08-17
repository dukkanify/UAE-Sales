import { getAllOrders } from "@/services/payments/order-store";

function isEscrowVisible(status: string) {
  return status === "held" || status === "released";
}

export async function getEscrowTransactions(userId?: string) {
  const orders = await getAllOrders();
  return orders
    .filter((order) => {
      if (!isEscrowVisible(order.escrowStatus)) return false;
      if (!userId) return true;
      return order.buyerId === userId || order.sellerId === userId;
    })
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

export async function getEscrowSummary(userId?: string) {
  const transactions = await getEscrowTransactions(userId);
  const held = transactions.filter((item) => item.status === "held");

  return {
    activeHolds: held.length,
    totalProtected: held.reduce((sum, item) => sum + item.amount, 0),
    currency: "AED" as const,
  };
}
