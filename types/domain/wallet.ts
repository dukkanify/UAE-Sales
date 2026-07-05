export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "escrow_hold"
  | "escrow_release"
  | "escrow_refund"
  | "payment";

export type WalletTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  description: string;
  createdAt: string;
};

export type WalletSummary = {
  availableBalance: number;
  pendingBalance: number;
  heldBalance: number;
  currency: "AED";
  totalTransactions: number;
  transactions: WalletTransaction[];
};
