/**
 * Payments, billing, invoices, wallets — domain types.
 * Amounts are integer minor units (e.g. fils for KWD, cents for USD).
 */

export type PaymentProvider = "mock" | "stripe" | "tamara" | "tabby";

export type PaymentMethodBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "apple_pay"
  | "google_pay"
  | "card"
  | "uae_local"
  | "tamara"
  | "tabby";

/** Checkout payment mode for ATPL packages / regional rules (CR003). */
export type CheckoutPaymentMode = "full" | "installments" | "tamara" | "tabby";

export type BnplProvider = "tamara" | "tabby";

export type InstallmentPlanStatus =
  "pending_kyc" | "active" | "completed" | "overdue" | "suspended" | "cancelled";

export type InstallmentItemStatus = "upcoming" | "due" | "paid" | "overdue" | "waived";

export type KycDocumentKind = "passport";

export type KycDocumentStatus = "uploaded" | "verified" | "rejected";

export type PricingModel =
  | "one_time"
  | "subscription_monthly"
  | "subscription_annual"
  | "premium_membership"
  | "package"
  | "free";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled" | "expired";

export type PaymentStatus =
  "requires_payment" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";

export type InvoiceStatus = "draft" | "issued" | "paid" | "void" | "refunded";

export type CouponType = "percent" | "fixed";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";

export type PayoutStatus = "submitted" | "under_review" | "approved" | "rejected" | "paid";

export type RefundStatus = "requested" | "approved" | "rejected" | "processed" | "failed";

export type WalletTxnType =
  | "course_sale"
  | "subscription"
  | "live_session"
  | "payout"
  | "refund_clawback"
  | "adjustment"
  | "platform_fee";

export type LedgerKind =
  | "payment"
  | "refund"
  | "coupon"
  | "withdrawal"
  | "invoice"
  | "subscription"
  | "payout"
  | "adjustment";

export interface Money {
  amount: number;
  currency: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  pricingModel: PricingModel;
  courseId: string | null;
  instructorId: string | null;
  priceAmount: number;
  compareAtAmount: number | null;
  currency: string;
  isFree: boolean;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  courseId: string | null;
  maxUses: number | null;
  usedCount: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  expiresAt: string | null;
  active: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  courseId: string | null;
  instructorId: string | null;
  pricingModel: PricingModel;
  unitAmount: number;
  quantity: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: OrderStatus;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  taxRatePercent: number;
  totalAmount: number;
  couponId: string | null;
  couponCode: string | null;
  billingName: string;
  billingEmail: string;
  billingCountry: string;
  billingAddress: string;
  items: OrderItem[];
  paymentId: string | null;
  invoiceId: string | null;
  idempotencyKey: string;
  failureReason: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  status: PaymentStatus;
  methodBrand: PaymentMethodBrand;
  /** Tokenized / masked only — never raw PAN */
  paymentMethodSummary: string;
  amount: number;
  currency: string;
  clientSecret: string | null;
  checkoutUrl: string | null;
  webhookVerified: boolean;
  failureCode: string | null;
  failureMessage: string | null;
  rawProviderPayload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: InvoiceStatus;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethodSummary: string;
  items: InvoiceItem[];
  issuedAt: string | null;
  paidAt: string | null;
  pdfReady: boolean;
  emailedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  productId: string;
  productName: string;
  status: SubscriptionStatus;
  pricingModel: PricingModel;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorWallet {
  id: string;
  instructorId: string;
  instructorName: string;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarned: number;
  lifetimeWithdrawn: number;
  courseRevenue: number;
  liveClassRevenue: number;
  subscriptionRevenue: number;
  updatedAt: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  instructorId: string;
  type: WalletTxnType;
  direction: "credit" | "debit";
  amount: number;
  currency: string;
  availableDelta: number;
  pendingDelta: number;
  orderId: string | null;
  payoutId: string | null;
  description: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  payoutNumber: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  methodSummary: string;
  adminNotes: string | null;
  rejectionReason: string | null;
  reviewedById: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  id: string;
  refundNumber: string;
  orderId: string;
  paymentId: string;
  studentId: string;
  amount: number;
  currency: string;
  isPartial: boolean;
  reason: string;
  status: RefundStatus;
  adminNotes: string | null;
  reviewedById: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionLog {
  id: string;
  kind: LedgerKind;
  referenceId: string;
  actorId: string | null;
  studentId: string | null;
  instructorId: string | null;
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentSettings {
  provider: PaymentProvider;
  currency: string;
  taxRatePercent: number;
  platformFeePercent: number;
  payoutMinimumAmount: number;
  allowApplePay: boolean;
  allowGooglePay: boolean;
  allowAmex: boolean;
  stripePublishableKeyConfigured: boolean;
  stripeWebhookSecretConfigured: boolean;
  /** CR003 — installment / regional BNPL */
  installmentReminderOffsetsDays: number[];
  installmentGraceDays: number;
  autoSuspendOnOverdue: boolean;
  agreementVersion: string;
  agreementText: string;
  defaultInstallmentCount: number;
}

/** Country-specific payment options (Tamara / Tabby / installments). */
export interface RegionalPaymentRule {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  allowFullPayment: boolean;
  allowInstallments: boolean;
  bnplProviders: BnplProvider[];
  maxInstallments: number;
  minAmount: number;
  requiresPassport: boolean;
  requiresAgreement: boolean;
  active: boolean;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface StudentKycDocument {
  id: string;
  userId: string;
  kind: KycDocumentKind;
  status: KycDocumentStatus;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  publicUrl: string | null;
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedById: string | null;
  uploadedAt: string;
  updatedAt: string;
}

export interface InstallmentPlan {
  id: string;
  orderId: string;
  studentId: string;
  productId: string;
  productName: string;
  courseIds: string[];
  countryCode: string;
  mode: CheckoutPaymentMode;
  status: InstallmentPlanStatus;
  currency: string;
  totalAmount: number;
  installmentCount: number;
  agreementAcceptedAt: string | null;
  agreementVersion: string | null;
  passportDocumentId: string | null;
  suspendedAt: string | null;
  resumedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentScheduleItem {
  id: string;
  planId: string;
  sequence: number;
  amount: number;
  currency: string;
  dueAt: string;
  status: InstallmentItemStatus;
  paidAt: string | null;
  paymentId: string | null;
  reminderSentAt: string[];
  lastReminderAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentReminderLog {
  id: string;
  planId: string;
  scheduleItemId: string;
  studentId: string;
  channel: "email" | "in_app";
  kind: "due_soon" | "due_today" | "overdue";
  sentAt: string;
  status: "sent" | "failed";
  error: string | null;
}
