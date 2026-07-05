import type { EscrowStatus } from "./order";

export type EscrowTransaction = {
  id: string;
  orderId: string;
  listingTitle: string;
  amount: number;
  status: EscrowStatus;
  buyerName: string;
  sellerName: string;
  createdAt: string;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
};

export type EscrowSummary = {
  activeHolds: number;
  totalProtected: number;
  currency: "AED";
};

export type EscrowFaqItem = {
  question: string;
  answer: string;
};
