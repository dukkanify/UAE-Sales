import type { EscrowSummary, EscrowTransaction, WalletSummary } from "@/types";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getEscrowTransactionsFromDb,
  getWalletFromDb,
} from "@/lib/repositories/transactions.repository";
import { mapEscrowSummary } from "@/lib/mappers/transaction.mapper";
import { mockEscrowTransactions, mockWalletSummary } from "@/mock/orders.mock";
import { apiClient, isApiConfigured } from "@/services/api";

async function getSessionUserId(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return null;
  }
  const { getCurrentSessionUser } = await import("@/lib/auth/session");
  const user = await getCurrentSessionUser();
  return user?.id ?? null;
}

export async function getWalletSummary(): Promise<WalletSummary> {
  if (isApiConfigured() && typeof window !== "undefined") {
    try {
      const wallet = await apiClient<{
        availableBalance: number;
        pendingBalance: number;
        currency: string;
      }>("/api/wallet");
      const transactions = await apiClient<
        WalletSummary["transactions"]
      >("/api/wallet/transactions");

      const heldBalance = transactions
        .filter((tx) => tx.type === "escrow_hold")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      return {
        availableBalance: wallet.availableBalance,
        pendingBalance: wallet.pendingBalance,
        heldBalance,
        currency: "AED",
        totalTransactions: transactions.length,
        transactions,
      };
    } catch {
      return mockWalletSummary;
    }
  }

  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return mockWalletSummary;
      }
      const wallet = await getWalletFromDb(userId);
      return wallet ?? mockWalletSummary;
    },
    async () => mockWalletSummary,
    "wallet",
  );
}

export async function getSavedListingsCount() {
  return 4;
}

export async function getEscrowTransactions(): Promise<EscrowTransaction[]> {
  if (isApiConfigured() && typeof window !== "undefined") {
    try {
      return await apiClient<EscrowTransaction[]>("/api/escrow/transactions");
    } catch {
      return mockEscrowTransactions;
    }
  }

  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return mockEscrowTransactions;
      }
      return getEscrowTransactionsFromDb(userId);
    },
    async () => mockEscrowTransactions,
    "escrow-transactions",
  );
}

export async function getEscrowSummary(): Promise<EscrowSummary> {
  const transactions = await getEscrowTransactions();
  return mapEscrowSummary(transactions);
}
