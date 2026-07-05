export type OrderStatus =
  | "pending"
  | "paid"
  | "completed"
  | "cancelled"
  | "disputed";

export type EscrowStatus =
  | "held"
  | "released"
  | "refunded"
  | "disputed";

export type OrderMetadata = {
  sellerDelivered?: boolean;
  sellerDeliveredAt?: string;
  buyerConfirmed?: boolean;
  buyerConfirmedAt?: string;
  platformFee?: number;
};

export type OrderTimelineStep = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  listingId: string;
  listingTitle: string;
  listingSlug?: string;
  listingImageUrl?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  paymentFee: number;
  platformFee: number;
  totalAmount: number;
  currency: "AED";
  status: OrderStatus;
  escrowStatus?: EscrowStatus;
  escrowAmount?: number;
  metadata?: OrderMetadata;
  createdAt: string;
  updatedAt: string;
};
