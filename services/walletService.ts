import type { WalletAccount } from "@/types/domain/wallet";
import { getWalletAccount } from "@/services/payments/wallet-ledger";

const EMPTY_SUMMARY = {
  availableBalance: 0,
  pendingBalance: 0,
  heldInEscrow: 0,
  currency: "AED" as const,
  recentActivity: [] as Array<{
    id: string;
    type:
      | "deposit"
      | "escrow_hold"
      | "release"
      | "withdrawal"
      | "refund"
      | "stripe_payment"
      | "platform_fee"
      | "escrow_release";
    amount: number;
    description: string;
    date: string;
    status: "completed" | "pending" | "failed";
  }>,
};

export async function getWalletSummaryForUser(userId?: string) {
  if (!userId) {
    return { ...EMPTY_SUMMARY, recentActivity: [] };
  }

  const ledger: WalletAccount = await getWalletAccount(userId);
  const activity = ledger.transactions.map((txn) => ({
    id: txn.id,
    type:
      txn.type === "escrow_release"
        ? ("release" as const)
        : txn.type === "stripe_payment"
          ? ("deposit" as const)
          : txn.type === "escrow_hold"
            ? ("escrow_hold" as const)
            : txn.type === "refund"
              ? ("deposit" as const)
              : txn.type === "withdrawal"
                ? ("withdrawal" as const)
                : ("deposit" as const),
    amount: txn.amount,
    description: txn.description,
    date: txn.date,
    status: txn.status,
  }));

  return {
    availableBalance: ledger.availableBalance,
    pendingBalance: ledger.pendingBalance,
    heldInEscrow: ledger.heldInEscrow,
    currency: ledger.currency,
    recentActivity: activity,
  };
}

export async function getWalletSummary(userId?: string) {
  return getWalletSummaryForUser(userId);
}

export async function getSavedListingsCount() {
  return 0;
}
