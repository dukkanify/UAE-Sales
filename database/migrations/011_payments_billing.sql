-- Payments, billing, wallets schema (aspirational twin of JSON store)
-- Task 012

CREATE TABLE IF NOT EXISTS payment_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pricing_model TEXT NOT NULL,
  course_id TEXT,
  instructor_id TEXT,
  price_amount INTEGER NOT NULL,
  compare_at_amount INTEGER,
  currency TEXT NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  course_id TEXT,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_purchase_amount INTEGER NOT NULL DEFAULT 0,
  max_discount_amount INTEGER,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL REFERENCES coupons(id),
  user_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  discount_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL,
  subtotal_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  coupon_id TEXT,
  idempotency_key TEXT NOT NULL,
  payment_id TEXT,
  invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_idx ON orders(student_id, idempotency_key);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  provider TEXT NOT NULL,
  provider_payment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  method_brand TEXT NOT NULL,
  payment_method_summary TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  webhook_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL,
  subtotal_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  tax_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  payment_method_summary TEXT NOT NULL,
  issued_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
  pricing_model TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS instructor_wallets (
  id TEXT PRIMARY KEY,
  instructor_id TEXT UNIQUE NOT NULL,
  currency TEXT NOT NULL,
  available_balance INTEGER NOT NULL DEFAULT 0,
  pending_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_withdrawn INTEGER NOT NULL DEFAULT 0,
  course_revenue INTEGER NOT NULL DEFAULT 0,
  live_class_revenue INTEGER NOT NULL DEFAULT 0,
  subscription_revenue INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL REFERENCES instructor_wallets(id),
  instructor_id TEXT NOT NULL,
  type TEXT NOT NULL,
  direction TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  order_id TEXT,
  payout_id TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id TEXT PRIMARY KEY,
  payout_number TEXT UNIQUE NOT NULL,
  instructor_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  method_summary TEXT NOT NULL,
  admin_notes TEXT,
  rejection_reason TEXT,
  reviewed_by_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  refund_number TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  is_partial BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  admin_notes TEXT,
  reviewed_by_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_logs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  actor_id TEXT,
  student_id TEXT,
  instructor_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO permissions (key, description)
VALUES
  ('billing.own', 'Student billing and checkout access')
ON CONFLICT DO NOTHING;

INSERT INTO platform_settings (key, value)
VALUES
  ('features.payments', 'true'),
  ('features.wallet', 'true')
ON CONFLICT DO NOTHING;
