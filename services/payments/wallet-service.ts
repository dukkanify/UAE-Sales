/**
 * Instructor wallets, ledger, and earnings.
 */

import { generateId } from "@/lib/security/crypto";
import {
  assertOwnWallet,
  PaymentError,
} from "@/services/payments/access";
import { calcPlatformFee } from "@/services/payments/money";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type {
  InstructorWallet,
  WalletTransaction,
  WalletTxnType,
} from "@/types/payments";
import type { UserProfile } from "@/types";
import { readAuthDb, toUserProfile } from "@/services/auth/store";

function nowIso() {
  return new Date().toISOString();
}

export function ensureWallet(instructorId: string): InstructorWallet {
  const existing = readPaymentsDb().wallets.find((w) => w.instructorId === instructorId);
  if (existing) return existing;

  const user = readAuthDb().users.find((u) => u.id === instructorId);
  const stamp = nowIso();
  const wallet: InstructorWallet = {
    id: generateId(),
    instructorId,
    instructorName: user ? toUserProfile(user).fullName || user.email : "Instructor",
    currency: readPaymentsDb().settings.currency,
    availableBalance: 0,
    pendingBalance: 0,
    lifetimeEarned: 0,
    lifetimeWithdrawn: 0,
    courseRevenue: 0,
    liveClassRevenue: 0,
    subscriptionRevenue: 0,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writePaymentsDb((db) => {
    db.wallets.push(wallet);
  });
  return wallet;
}

export function getWalletForUser(user: UserProfile, instructorId?: string): InstructorWallet {
  const id = instructorId ?? user.id;
  assertOwnWallet(user, id);
  return ensureWallet(id);
}

export function listWallets(): InstructorWallet[] {
  return [...readPaymentsDb().wallets].sort((a, b) =>
    b.availableBalance - a.availableBalance,
  );
}

export function listWalletTransactions(instructorId: string): WalletTransaction[] {
  return readPaymentsDb()
    .walletTransactions.filter((t) => t.instructorId === instructorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function creditInstructorEarnings(input: {
  instructorId: string;
  grossAmount: number;
  currency: string;
  orderId: string;
  type: WalletTxnType;
  description: string;
  settleImmediately?: boolean;
}): { net: number; fee: number } {
  const settings = readPaymentsDb().settings;
  const fee = calcPlatformFee(input.grossAmount, settings.platformFeePercent);
  const net = Math.max(0, input.grossAmount - fee);
  const wallet = ensureWallet(input.instructorId);
  const stamp = nowIso();
  const settle = input.settleImmediately ?? true;

  writePaymentsDb((db) => {
    const w = db.wallets.find((x) => x.id === wallet.id);
    if (!w) return;
    if (settle) {
      w.availableBalance += net;
    } else {
      w.pendingBalance += net;
    }
    w.lifetimeEarned += net;
    if (input.type === "course_sale") w.courseRevenue += net;
    if (input.type === "live_session") w.liveClassRevenue += net;
    if (input.type === "subscription") w.subscriptionRevenue += net;
    w.updatedAt = stamp;

    db.walletTransactions.unshift({
      id: generateId(),
      walletId: w.id,
      instructorId: w.instructorId,
      type: input.type,
      direction: "credit",
      amount: net,
      currency: input.currency,
      availableDelta: settle ? net : 0,
      pendingDelta: settle ? 0 : net,
      orderId: input.orderId,
      payoutId: null,
      description: input.description,
      createdAt: stamp,
    });

    if (fee > 0) {
      db.walletTransactions.unshift({
        id: generateId(),
        walletId: w.id,
        instructorId: w.instructorId,
        type: "platform_fee",
        direction: "debit",
        amount: fee,
        currency: input.currency,
        availableDelta: 0,
        pendingDelta: 0,
        orderId: input.orderId,
        payoutId: null,
        description: `Platform fee (${settings.platformFeePercent}%)`,
        createdAt: stamp,
      });
    }
  });

  return { net, fee };
}

export function releasePending(instructorId: string, amount: number) {
  writePaymentsDb((db) => {
    const w = db.wallets.find((x) => x.instructorId === instructorId);
    if (!w) return;
    const move = Math.min(amount, w.pendingBalance);
    w.pendingBalance -= move;
    w.availableBalance += move;
    w.updatedAt = nowIso();
  });
}

export function debitForPayout(instructorId: string, amount: number, payoutId: string) {
  const wallet = ensureWallet(instructorId);
  if (wallet.availableBalance < amount) {
    throw new PaymentError("Insufficient available balance");
  }
  const stamp = nowIso();
  writePaymentsDb((db) => {
    const w = db.wallets.find((x) => x.instructorId === instructorId);
    if (!w) return;
    w.availableBalance -= amount;
    w.lifetimeWithdrawn += amount;
    w.updatedAt = stamp;
    db.walletTransactions.unshift({
      id: generateId(),
      walletId: w.id,
      instructorId,
      type: "payout",
      direction: "debit",
      amount,
      currency: w.currency,
      availableDelta: -amount,
      pendingDelta: 0,
      orderId: null,
      payoutId,
      description: "Payout withdrawal",
      createdAt: stamp,
    });
  });
}

export function clawbackForRefund(instructorId: string, amount: number, orderId: string) {
  const stamp = nowIso();
  writePaymentsDb((db) => {
    const w = db.wallets.find((x) => x.instructorId === instructorId) ?? null;
    if (!w) return;
    const fromAvailable = Math.min(amount, w.availableBalance);
    w.availableBalance -= fromAvailable;
    const remainder = amount - fromAvailable;
    w.pendingBalance = Math.max(0, w.pendingBalance - remainder);
    w.updatedAt = stamp;
    db.walletTransactions.unshift({
      id: generateId(),
      walletId: w.id,
      instructorId,
      type: "refund_clawback",
      direction: "debit",
      amount,
      currency: w.currency,
      availableDelta: -fromAvailable,
      pendingDelta: -remainder,
      orderId,
      payoutId: null,
      description: "Refund clawback",
      createdAt: stamp,
    });
  });
}
