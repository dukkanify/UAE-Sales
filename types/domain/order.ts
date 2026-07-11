import type { ShippingMethodId } from "@/types/domain/address";

export type OrderStatus =
  | "pending_payment"
  | "paid_held_in_escrow"
  | "delivered"
  | "confirmed"
  | "released"
  | "disputed"
  | "refunded";

export type EscrowStatus =
  | "pending"
  | "held"
  | "released"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

export type OrderFeeBreakdown = {
  productPrice: number;
  shippingFee: number;
  gatewayFee: number;
  platformFee: number;
  total: number;
  currency: "AED";
};

export type OrderAuditEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, string>;
};

export type Order = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  paymentStatus: PaymentStatus;
  fees: OrderFeeBreakdown;
  shippingMethod?: ShippingMethodId;
  deliveryAddressId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  confirmedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  auditLog: OrderAuditEvent[];
};
