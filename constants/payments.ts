/**
 * Payments constants — labels and defaults.
 */

import type {
  CouponType,
  OrderStatus,
  PaymentMethodBrand,
  PayoutStatus,
  PricingModel,
  RefundStatus,
  SubscriptionStatus,
} from "@/types/payments";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  one_time: "One-time purchase",
  subscription_monthly: "Monthly subscription",
  subscription_annual: "Annual subscription",
  premium_membership: "Premium membership",
  package: "Discounted package",
  free: "Free",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  card: "Card",
  uae_local: "UAE local (future)",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  processed: "Processed",
  failed: "Failed",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  expired: "Expired",
};

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percent: "Percentage",
  fixed: "Fixed amount",
};

export const DEFAULT_PAYMENT_CURRENCY = "KWD";
export const DEFAULT_TAX_RATE_PERCENT = 0;
export const DEFAULT_PLATFORM_FEE_PERCENT = 20;
export const ORDER_EXPIRY_MINUTES = 60;
