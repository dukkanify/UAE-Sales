/**
 * Payments constants — labels and defaults.
 */

import type {
  CheckoutPaymentMode,
  CouponType,
  InstallmentItemStatus,
  InstallmentPlanStatus,
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
  tamara: "Tamara",
  tabby: "Tabby (تالي)",
};

export const CHECKOUT_PAYMENT_MODE_LABELS: Record<CheckoutPaymentMode, string> = {
  full: "Full payment",
  installments: "Installments",
  tamara: "Tamara",
  tabby: "Tabby (تالي)",
};

export const INSTALLMENT_PLAN_STATUS_LABELS: Record<InstallmentPlanStatus, string> = {
  pending_kyc: "Pending KYC",
  active: "Active",
  completed: "Completed",
  overdue: "Overdue",
  suspended: "Suspended",
  cancelled: "Cancelled",
};

export const INSTALLMENT_ITEM_STATUS_LABELS: Record<InstallmentItemStatus, string> = {
  upcoming: "Upcoming",
  due: "Due",
  paid: "Paid",
  overdue: "Overdue",
  waived: "Waived",
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

/** Default installment reminder offsets (days before due). */
export const DEFAULT_INSTALLMENT_REMINDER_OFFSETS_DAYS = [7, 3, 1, 0];

export const DEFAULT_PAYMENT_AGREEMENT_VERSION = "atpl-installments-v1";

export const DEFAULT_PAYMENT_AGREEMENT_TEXT = `AviatorPass ATPL Package Installment Agreement

By accepting this agreement you confirm that:
1. You will pay each installment by its due date.
2. Late payments may result in suspension of course access until the balance is brought current.
3. Tamara and Tabby (تالي) availability depends on your billing country and provider eligibility.
4. Passport verification may be required before installments or BNPL are activated.
5. Refunds follow AviatorPass billing policy and provider rules.`;
