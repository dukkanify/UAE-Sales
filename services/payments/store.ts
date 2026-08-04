/**
 * Payments durable store (.data/aep-payments.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type {
  CatalogProduct,
  Coupon,
  CouponUsage,
  InstructorWallet,
  Invoice,
  Order,
  PaymentRecord,
  PaymentSettings,
  PayoutRequest,
  RefundRequest,
  Subscription,
  TransactionLog,
  WalletTransaction,
} from "@/types/payments";
import {
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
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-payments.json");

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
    seeded: false,
  };
}

export function ensurePaymentsStore(): PaymentsDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<PaymentsDatabase>;
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
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readPaymentsDb(): PaymentsDatabase {
  return ensurePaymentsStore();
}

export function writePaymentsDb(
  mutator: (db: PaymentsDatabase) => void,
): PaymentsDatabase {
  const db = ensurePaymentsStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
