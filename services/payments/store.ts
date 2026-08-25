/**
 * Payments durable store (.data/aep-payments.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 marketing SSR.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  CatalogProduct,
  Coupon,
  CouponUsage,
  InstallmentPlan,
  InstallmentReminderLog,
  InstallmentScheduleItem,
  InstructorWallet,
  Invoice,
  Order,
  PaymentRecord,
  PaymentSettings,
  PayoutRequest,
  RefundRequest,
  RegionalPaymentRule,
  StudentKycDocument,
  Subscription,
  TransactionLog,
  WalletTransaction,
} from "@/types/payments";
import {
  DEFAULT_INSTALLMENT_REMINDER_OFFSETS_DAYS,
  DEFAULT_PAYMENT_AGREEMENT_TEXT,
  DEFAULT_PAYMENT_AGREEMENT_VERSION,
  DEFAULT_PAYMENT_CURRENCY,
  DEFAULT_PLATFORM_FEE_PERCENT,
  DEFAULT_TAX_RATE_PERCENT,
} from "@/constants/payments";

export interface PaymentsDatabase {
  settings: PaymentSettings;
  products: CatalogProduct[];
  coupons: Coupon[];
  couponUsages: CouponUsage[];
  orders: Order[];
  payments: PaymentRecord[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  wallets: InstructorWallet[];
  walletTransactions: WalletTransaction[];
  payouts: PayoutRequest[];
  refunds: RefundRequest[];
  transactionLogs: TransactionLog[];
  regionalRules: RegionalPaymentRule[];
  installmentPlans: InstallmentPlan[];
  installmentSchedule: InstallmentScheduleItem[];
  installmentReminders: InstallmentReminderLog[];
  kycDocuments: StudentKycDocument[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-payments.json");
}

function defaultSettings(): PaymentSettings {
  return {
    provider: "mock",
    currency: DEFAULT_PAYMENT_CURRENCY,
    taxRatePercent: DEFAULT_TAX_RATE_PERCENT,
    platformFeePercent: DEFAULT_PLATFORM_FEE_PERCENT,
    payoutMinimumAmount: 10_000, // 10.000 KWD in fils
    allowApplePay: true,
    allowGooglePay: true,
    allowAmex: true,
    stripePublishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    stripeWebhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    installmentReminderOffsetsDays: [...DEFAULT_INSTALLMENT_REMINDER_OFFSETS_DAYS],
    installmentGraceDays: 3,
    autoSuspendOnOverdue: true,
    agreementVersion: DEFAULT_PAYMENT_AGREEMENT_VERSION,
    agreementText: DEFAULT_PAYMENT_AGREEMENT_TEXT,
    defaultInstallmentCount: 4,
  };
}

function emptyDb(): PaymentsDatabase {
  return {
    settings: defaultSettings(),
    products: [],
    coupons: [],
    couponUsages: [],
    orders: [],
    payments: [],
    invoices: [],
    subscriptions: [],
    wallets: [],
    walletTransactions: [],
    payouts: [],
    refunds: [],
    transactionLogs: [],
    regionalRules: [],
    installmentPlans: [],
    installmentSchedule: [],
    installmentReminders: [],
    kycDocuments: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<PaymentsDatabase>): PaymentsDatabase {
  return {
    ...emptyDb(),
    ...raw,
    settings: { ...defaultSettings(), ...(raw.settings ?? {}) },
    products: raw.products ?? [],
    coupons: raw.coupons ?? [],
    couponUsages: raw.couponUsages ?? [],
    orders: raw.orders ?? [],
    payments: raw.payments ?? [],
    invoices: raw.invoices ?? [],
    subscriptions: raw.subscriptions ?? [],
    wallets: raw.wallets ?? [],
    walletTransactions: raw.walletTransactions ?? [],
    payouts: raw.payouts ?? [],
    refunds: raw.refunds ?? [],
    transactionLogs: raw.transactionLogs ?? [],
    regionalRules: raw.regionalRules ?? [],
    installmentPlans: raw.installmentPlans ?? [],
    installmentSchedule: raw.installmentSchedule ?? [],
    installmentReminders: raw.installmentReminders ?? [],
    kycDocuments: raw.kycDocuments ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensurePaymentsStore(): PaymentsDatabase {
  const raw = readJsonFile<Partial<PaymentsDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readPaymentsDb(): PaymentsDatabase {
  return ensurePaymentsStore();
}

export function writePaymentsDb(mutator: (db: PaymentsDatabase) => void): PaymentsDatabase {
  const db = ensurePaymentsStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
