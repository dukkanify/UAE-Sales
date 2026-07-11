export type WalletTransactionType =
  | "deposit"
  | "escrow_hold"
  | "escrow_release"
  | "withdrawal"
  | "refund"
  | "platform_fee"
  | "stripe_payment";

export type WalletTransaction = {
  id: string;
  userId: string;
  orderId?: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
};

export type WalletAccount = {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  heldInEscrow: number;
  currency: "AED";
  transactions: WalletTransaction[];
};
