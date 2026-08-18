import {
  createDispute,
  getDisputeById,
  patchAdminDispute,
} from "@/services/admin/dispute-store";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { createNotification } from "@/services/payments/notification-store";
import {
  computeDisputeWindow,
  DISPUTE_ELIGIBLE_STATUSES,
} from "@/services/payments/dispute-window";
import { getAllUsers } from "@/services/auth/user-store";
import {
  getOrderById,
  isValidOrderTransition,
  updateOrder,
} from "@/services/payments/order-store";
import type {
  AdminDisputeRecord,
  DisputeReasonCode,
  DisputeStatus,
} from "@/types/domain/admin";
import type { Order } from "@/types/domain/order";
import { DISPUTE_REASON_LABELS } from "@/shared/constants/disputes";
import { formatCurrencyLabel } from "@/shared/utils/currency";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function openDisputeFromOrder(
  orderId: string,
  buyerId: string,
  reason: string,
  evidenceUrls?: string[],
  reasonCode: DisputeReasonCode = "other",
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
  if (!DISPUTE_ELIGIBLE_STATUSES.includes(order.status)) {
    throw new Error("INVALID_STATUS");
  }
  if (!isValidOrderTransition(order.status, "disputed")) {
    throw new Error("INVALID_STATUS");
  }

  const settings = await getAdminSettings();
  const window = computeDisputeWindow(order, settings);
  if (window.closed) {
    throw new Error("DISPUTE_WINDOW_CLOSED");
  }

  const updated = await updateOrder(
    orderId,
    { status: "disputed" },
    {
      type: "dispute_opened",
      message: "فتح المشتري نزاعاً على الطلب",
      metadata: {
        reason: trimmedReason.slice(0, 120),
        reasonCode,
      },
    },
  );
  if (!updated) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const now = Date.now();
  const dispute = await createDispute({
    orderId: order.id,
    listingTitle: order.listingTitle,
    buyerName: order.buyerName,
    sellerName: order.sellerName,
    buyerId: order.buyerId ?? buyerId,
    sellerId: order.sellerId,
    reason: trimmedReason,
    reasonCode,
    amount: order.fees.total,
    evidenceUrls,
    windowDays: window.windowDays,
    windowClosesAt: window.closesAt,
    responseDueAt: new Date(now + window.responseDays * DAY_MS).toISOString(),
  });

  const reasonLabel = DISPUTE_REASON_LABELS[reasonCode];
  const href = "/dashboard/disputes";

  if (order.buyerId) {
    await createNotification({
      userId: order.buyerId,
      orderId: order.id,
      type: "order_disputed",
      title: "تم فتح النزاع",
      body: `سجّلنا نزاعك على «${order.listingTitle}» (${reasonLabel}). البائع لديه ${window.responseDays} أيام للرد، والإدارة تراجع الضمان.`,
      href,
    });
  }

  await createNotification({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_disputed",
    title: "نزاع جديد — يلزم ردك",
    body: `فتح المشتري نزاعاً على «${order.listingTitle}» (${reasonLabel}) بمبلغ ${formatCurrencyLabel(order.fees.total)}. الرد خلال ${window.responseDays} أيام.`,
    href,
  });

  await notifyAdminsOfDispute({
    amount: order.fees.total,
    listingTitle: order.listingTitle,
    orderId: order.id,
    reasonLabel,
    skipUserIds: [order.buyerId, order.sellerId, buyerId].filter(
      (id): id is string => Boolean(id),
    ),
  });

  return { order: updated, dispute };
}

async function notifyAdminsOfDispute(input: {
  amount: number;
  listingTitle: string;
  orderId: string;
  reasonLabel: string;
  skipUserIds: string[];
}): Promise<void> {
  const skip = new Set(input.skipUserIds);
  const admins = (await getAllUsers()).filter(
    (user) => user.role === "admin" && !skip.has(user.id),
  );

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        orderId: input.orderId,
        type: "order_disputed",
        title: "نزاع جديد للمراجعة",
        body: `نزاع على «${input.listingTitle}» (${input.reasonLabel}) بمبلغ ${formatCurrencyLabel(input.amount)}. راجع المهلة والأدلة من لوحة النزاعات.`,
        href: "/admin/disputes",
      }),
    ),
  );
}

export async function respondToDispute(
  disputeId: string,
  sellerId: string,
  message: string,
): Promise<AdminDisputeRecord> {
  const trimmed = message.trim();
  if (trimmed.length < 8) {
    throw new Error("INVALID_RESPONSE");
  }

  const dispute = await getDisputeById(disputeId);
  if (!dispute) {
    throw new Error("NOT_FOUND");
  }
  if (dispute.status !== "open" && dispute.status !== "under_review") {
    throw new Error("INVALID_STATUS");
  }

  const order = await getOrderById(dispute.orderId);
  const isSeller =
    dispute.sellerId === sellerId || order?.sellerId === sellerId;
  if (!isSeller) {
    throw new Error("UNAUTHORIZED");
  }

  const updated = await patchAdminDispute(disputeId, {
    sellerResponse: trimmed,
    sellerRespondedAt: new Date().toISOString(),
    status: dispute.status === "open" ? "under_review" : dispute.status,
  });
  if (!updated) {
    throw new Error("NOT_FOUND");
  }

  const buyerId = dispute.buyerId ?? order?.buyerId;
  if (buyerId) {
    await createNotification({
      userId: buyerId,
      orderId: dispute.orderId,
      type: "dispute_seller_response",
      title: "رد البائع على النزاع",
      body: `رد البائع على نزاع «${dispute.listingTitle}». راجعه من لوحة النزاعات.`,
      href: "/dashboard/disputes",
    });
  }

  return updated;
}

const RESOLUTION_COPY: Record<
  Extract<DisputeStatus, "resolved_buyer" | "resolved_seller" | "closed">,
  { title: string; buyer: string; seller: string }
> = {
  resolved_buyer: {
    title: "تقرر النزاع لصالحك",
    buyer: "حكمت الإدارة لصالحك واسترداد المبلغ من الضمان.",
    seller: "تقرر النزاع لصالح المشتري واسترداد المبلغ.",
  },
  resolved_seller: {
    title: "أُغلق النزاع لصالح البائع",
    buyer: "تقرر النزاع لصالح البائع وتحرير مبلغ الضمان.",
    seller: "حكمت الإدارة لصالحك وتم تحرير مبلغ الضمان.",
  },
  closed: {
    title: "أُغلق النزاع",
    buyer: "أُغلق نزاع هذا الطلب من الإدارة.",
    seller: "أُغلق نزاع هذا الطلب من الإدارة.",
  },
};

export async function notifyDisputeResolution(
  dispute: AdminDisputeRecord,
  status: DisputeStatus,
): Promise<void> {
  if (
    status !== "resolved_buyer" &&
    status !== "resolved_seller" &&
    status !== "closed"
  ) {
    return;
  }

  const copy = RESOLUTION_COPY[status];
  const order = await getOrderById(dispute.orderId);
  const buyerId = dispute.buyerId ?? order?.buyerId;
  const sellerId = dispute.sellerId ?? order?.sellerId;

  if (buyerId) {
    await createNotification({
      userId: buyerId,
      orderId: dispute.orderId,
      type: "dispute_resolved",
      title: status === "resolved_buyer" ? copy.title : "تحديث نزاع",
      body: `${copy.buyer} الطلب: «${dispute.listingTitle}».`,
      href: "/dashboard/disputes",
    });
  }
  if (sellerId) {
    await createNotification({
      userId: sellerId,
      orderId: dispute.orderId,
      type: "dispute_resolved",
      title: status === "resolved_seller" ? copy.title : "تحديث نزاع",
      body: `${copy.seller} الطلب: «${dispute.listingTitle}».`,
      href: "/dashboard/disputes",
    });
  }
}

