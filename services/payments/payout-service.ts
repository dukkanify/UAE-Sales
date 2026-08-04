/**
 * Instructor payout requests workflow.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  assertCanManageFinance,
  assertOwnWallet,
  PaymentError,
} from "@/services/payments/access";
import { formatMinor } from "@/services/payments/money";
import { notifyPayment } from "@/services/payments/notify";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import {
  debitForPayout,
  ensureWallet,
} from "@/services/payments/wallet-service";
import type { PayoutRequest } from "@/types/payments";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function nextPayoutNumber(): string {
  const n = readPaymentsDb().payouts.length + 1;
  return `PAYOUT-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

export function listPayouts(filters?: { instructorId?: string; status?: PayoutRequest["status"] | "all" }) {
  let rows = [...readPaymentsDb().payouts];
  if (filters?.instructorId) {
    rows = rows.filter((p) => p.instructorId === filters.instructorId);
  }
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((p) => p.status === filters.status);
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPayout(id: string): PayoutRequest | null {
  return readPaymentsDb().payouts.find((p) => p.id === id) ?? null;
}

export async function requestPayout(input: {
  user: UserProfile;
  amount: number;
  methodSummary?: string;
}): Promise<PayoutRequest> {
  assertOwnWallet(input.user, input.user.id);
  const wallet = ensureWallet(input.user.id);
  const settings = readPaymentsDb().settings;
  if (input.amount < settings.payoutMinimumAmount) {
    throw new PaymentError(
      `Minimum payout is ${formatMinor(settings.payoutMinimumAmount, wallet.currency)}`,
    );
  }
  if (input.amount > wallet.availableBalance) {
    throw new PaymentError("Insufficient available balance");
  }

  const stamp = nowIso();
  const payout: PayoutRequest = {
    id: generateId(),
    payoutNumber: nextPayoutNumber(),
    instructorId: input.user.id,
    instructorName: wallet.instructorName,
    amount: input.amount,
    currency: wallet.currency,
    status: "submitted",
    methodSummary: input.methodSummary ?? "Bank transfer",
    adminNotes: null,
    rejectionReason: null,
    reviewedById: null,
    paidAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.payouts.unshift(payout);
    db.transactionLogs.unshift({
      id: generateId(),
      kind: "payout",
      referenceId: payout.id,
      actorId: input.user.id,
      studentId: null,
      instructorId: input.user.id,
      amount: input.amount,
      currency: wallet.currency,
      description: `Payout requested ${payout.payoutNumber}`,
      metadata: {},
      createdAt: stamp,
    });
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.PAYOUT_REQUESTED,
    entityType: "payout",
    entityId: payout.id,
  });

  return payout;
}

export async function reviewPayout(input: {
  user: UserProfile;
  payoutId: string;
  decision: "review" | "approve" | "reject" | "paid";
  notes?: string;
}): Promise<PayoutRequest> {
  assertCanManageFinance(input.user);
  const payout = getPayout(input.payoutId);
  if (!payout) throw new PaymentError("Payout not found", 404);
  const stamp = nowIso();

  if (input.decision === "review") {
    writePaymentsDb((db) => {
      const p = db.payouts.find((x) => x.id === payout.id);
      if (!p) return;
      p.status = "under_review";
      p.adminNotes = input.notes ?? p.adminNotes;
      p.reviewedById = input.user.id;
      p.updatedAt = stamp;
    });
    return getPayout(payout.id)!;
  }

  if (input.decision === "reject") {
    writePaymentsDb((db) => {
      const p = db.payouts.find((x) => x.id === payout.id);
      if (!p) return;
      p.status = "rejected";
      p.rejectionReason = input.notes ?? "Rejected";
      p.reviewedById = input.user.id;
      p.updatedAt = stamp;
    });
    await notifyPayment(payout.instructorId, {
      title: "Payout rejected",
      body: `${payout.payoutNumber} was rejected.`,
      type: "payout.rejected",
      data: { payoutId: payout.id },
    });
    return getPayout(payout.id)!;
  }

  if (input.decision === "approve") {
    writePaymentsDb((db) => {
      const p = db.payouts.find((x) => x.id === payout.id);
      if (!p) return;
      p.status = "approved";
      p.adminNotes = input.notes ?? p.adminNotes;
      p.reviewedById = input.user.id;
      p.updatedAt = stamp;
    });
    await notifyPayment(payout.instructorId, {
      title: "Payout approved",
      body: `${payout.payoutNumber} for ${formatMinor(payout.amount, payout.currency)} was approved.`,
      type: "payout.approved",
      data: { payoutId: payout.id },
    });
    return getPayout(payout.id)!;
  }

  // paid
  if (payout.status !== "approved" && payout.status !== "under_review" && payout.status !== "submitted") {
    throw new PaymentError("Payout cannot be marked paid from current status");
  }
  debitForPayout(payout.instructorId, payout.amount, payout.id);
  writePaymentsDb((db) => {
    const p = db.payouts.find((x) => x.id === payout.id);
    if (!p) return;
    p.status = "paid";
    p.paidAt = stamp;
    p.reviewedById = input.user.id;
    p.updatedAt = stamp;
  });

  await notifyPayment(payout.instructorId, {
    title: "Payout completed",
    body: `${payout.payoutNumber} has been paid.`,
    type: "payout.completed",
    data: { payoutId: payout.id },
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.PAYOUT_PAID,
    entityType: "payout",
    entityId: payout.id,
  });

  return getPayout(payout.id)!;
}
