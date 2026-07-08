import type { WalletAccount } from "@/types/domain/wallet";
import { getWalletAccount } from "@/services/payments/wallet-ledger";

const MOCK_ACTIVITY = [
  {
    id: "txn-001",
    type: "deposit" as const,
    amount: 1500,
    description: "إيداع عبر بطاقة بنكية",
    date: "2026-06-28T14:30:00+04:00",
    status: "completed" as const,
  },
];

export async function getWalletSummaryForUser(userId?: string) {
  if (!userId) {
    return {
      availableBalance: 2450,
      pendingBalance: 850,
      heldInEscrow: 0,
      currency: "AED" as const,
      recentActivity: MOCK_ACTIVITY,
    };
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
    recentActivity: activity.length > 0 ? activity : MOCK_ACTIVITY,
  };
}

export async function getWalletSummary(userId?: string) {
  return getWalletSummaryForUser(userId);
}

export async function getSavedListingsCount() {
  return 4;
}
