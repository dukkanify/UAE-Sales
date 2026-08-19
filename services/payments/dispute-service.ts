import { createDispute } from "@/services/admin/dispute-store";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { notifyDisputeOpened } from "@/services/notifications/notification-events";
import {
  getOrderById,
  isValidOrderTransition,
  updateOrder,
} from "@/services/payments/order-store";
import type { AdminDisputeRecord } from "@/types/domain/admin";
import type { Order, OrderStatus } from "@/types/domain/order";

const DISPUTE_ELIGIBLE: OrderStatus[] = [
  "paid_held_in_escrow",
  "delivered",
  "confirmed",
];

export async function openDisputeFromOrder(
  orderId: string,
  buyerId: string,
  reason: string,
  evidenceUrls?: string[],
): Promise<{ order: Order; dispute: AdminDisputeRecord }> {
  const trimmedReason = reason.trim();
  if (trimmedReason.length < 10) {
    throw new Error("INVALID_REASON");
  }

  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  if (order.buyerId !== buyerId) {
    throw new Error("UNAUTHORIZED");
  }
  if (!DISPUTE_ELIGIBLE.includes(order.status)) {
    throw new Error("INVALID_STATUS");
  }
  if (!isValidOrderTransition(order.status, "disputed")) {
    throw new Error("INVALID_STATUS");
  }

  const settings = await getAdminSettings();
  const windowStart = new Date(order.paidAt ?? order.createdAt).getTime();
  const windowMs = settings.disputeWindowDays * 24 * 60 * 60 * 1000;
  if (Number.isFinite(windowStart) && Date.now() > windowStart + windowMs) {
    throw new Error("DISPUTE_WINDOW_CLOSED");
  }

  const updated = await updateOrder(
    orderId,
    { status: "disputed" },
    {
      type: "dispute_opened",
      message: "فتح المشتري نزاعاً على الطلب",
      metadata: { reason: trimmedReason.slice(0, 120) },
    },
  );
  if (!updated) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const dispute = await createDispute({
    orderId: order.id,
    listingTitle: order.listingTitle,
    buyerName: order.buyerName,
    sellerName: order.sellerName,
    reason: trimmedReason,
    amount: order.fees.total,
    evidenceUrls,
  });

  void notifyDisputeOpened(order, dispute.id);

  return { order: updated, dispute };
}
