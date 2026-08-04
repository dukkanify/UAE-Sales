/**
 * Refund requests and processing.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  assertCanManageFinance,
  assertOwnOrder,
  PaymentError,
} from "@/services/payments/access";
import { getOrder } from "@/services/payments/checkout-service";
import { formatMinor } from "@/services/payments/money";
import { notifyPayment } from "@/services/payments/notify";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import { clawbackForRefund } from "@/services/payments/wallet-service";
import type { RefundRequest } from "@/types/payments";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function nextRefundNumber(): string {
  const n = readPaymentsDb().refunds.length + 1;
  return `REF-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

export function listRefunds(filters?: { studentId?: string; status?: RefundRequest["status"] | "all" }) {
  let rows = [...readPaymentsDb().refunds];
  if (filters?.studentId) rows = rows.filter((r) => r.studentId === filters.studentId);
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRefund(id: string): RefundRequest | null {
  return readPaymentsDb().refunds.find((r) => r.id === id) ?? null;
}

export async function requestRefund(input: {
  user: UserProfile;
  orderId: string;
  amount?: number;
  reason: string;
}): Promise<RefundRequest> {
  const order = getOrder(input.orderId);
  if (!order) throw new PaymentError("Order not found", 404);
  assertOwnOrder(input.user, order.studentId);
  if (order.status !== "paid") throw new PaymentError("Only paid orders can be refunded");
  if (!order.paymentId) throw new PaymentError("Missing payment on order");

  const amount = input.amount ?? order.totalAmount;
  if (amount <= 0 || amount > order.totalAmount) {
    throw new PaymentError("Invalid refund amount");
  }

  const stamp = nowIso();
  const refund: RefundRequest = {
    id: generateId(),
    refundNumber: nextRefundNumber(),
    orderId: order.id,
    paymentId: order.paymentId,
    studentId: order.studentId,
    amount,
    currency: order.currency,
    isPartial: amount < order.totalAmount,
    reason: input.reason.trim(),
    status: "requested",
    adminNotes: null,
    reviewedById: null,
    processedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.refunds.unshift(refund);
    db.transactionLogs.unshift({
      id: generateId(),
      kind: "refund",
      referenceId: refund.id,
      actorId: input.user.id,
      studentId: order.studentId,
      instructorId: order.items[0]?.instructorId ?? null,
      amount,
      currency: order.currency,
      description: `Refund requested for ${order.orderNumber}`,
      metadata: { reason: refund.reason },
      createdAt: stamp,
    });
  });

  return refund;
}

export async function reviewRefund(input: {
  user: UserProfile;
  refundId: string;
  decision: "approve" | "reject";
  adminNotes?: string;
}): Promise<RefundRequest> {
  assertCanManageFinance(input.user);
  const refund = getRefund(input.refundId);
  if (!refund) throw new PaymentError("Refund not found", 404);
  if (refund.status !== "requested") throw new PaymentError("Refund already reviewed");

  const stamp = nowIso();

  if (input.decision === "reject") {
    writePaymentsDb((db) => {
      const r = db.refunds.find((x) => x.id === refund.id);
      if (!r) return;
      r.status = "rejected";
      r.adminNotes = input.adminNotes ?? null;
      r.reviewedById = input.user.id;
      r.updatedAt = stamp;
    });
    await notifyPayment(refund.studentId, {
      title: "Refund rejected",
      body: `${refund.refundNumber} was rejected.`,
      type: "refund.rejected",
      data: { refundId: refund.id },
    });
    return getRefund(refund.id)!;
  }

  // Approve + process
  const order = getOrder(refund.orderId);
  writePaymentsDb((db) => {
    const r = db.refunds.find((x) => x.id === refund.id);
    if (!r) return;
    r.status = "processed";
    r.adminNotes = input.adminNotes ?? null;
    r.reviewedById = input.user.id;
    r.processedAt = stamp;
    r.updatedAt = stamp;

    const o = db.orders.find((x) => x.id === refund.orderId);
    if (o) {
      o.status = refund.isPartial ? o.status : "refunded";
      if (!refund.isPartial) o.status = "refunded";
      o.updatedAt = stamp;
    }
    const p = db.payments.find((x) => x.id === refund.paymentId);
    if (p) {
      p.status = refund.isPartial ? "partially_refunded" : "refunded";
      p.updatedAt = stamp;
    }
  });

  if (order) {
    for (const item of order.items) {
      if (item.instructorId) {
        const share = Math.round(
          (refund.amount * (item.totalAmount || 1)) / Math.max(order.totalAmount, 1),
        );
        clawbackForRefund(item.instructorId, share, order.id);
      }
    }
  }

  await notifyPayment(refund.studentId, {
    title: "Refund approved",
    body: `${refund.refundNumber} for ${formatMinor(refund.amount, refund.currency)} was processed.`,
    type: "refund.approved",
    data: { refundId: refund.id },
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.REFUND_PROCESSED,
    entityType: "refund",
    entityId: refund.id,
  });

  return getRefund(refund.id)!;
}
