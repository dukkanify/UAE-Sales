-- OTP requests (durable; hashed codes only)
CREATE TABLE IF NOT EXISTS otp_requests (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  user_id TEXT,
  purpose TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  resend_available_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS otp_requests_email_purpose_idx ON otp_requests (email, purpose);

-- In-app notifications
CREATE TABLE IF NOT EXISTS app_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  body TEXT NOT NULL,
  body_en TEXT,
  href TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  dedupe_key TEXT
);
CREATE INDEX IF NOT EXISTS app_notifications_user_idx ON app_notifications (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS app_notifications_dedupe_idx
  ON app_notifications (user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- Marketplace listings catalog
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  seller_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  status TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx ON marketplace_listings (status);
CREATE INDEX IF NOT EXISTS marketplace_listings_seller_idx ON marketplace_listings (seller_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_category_idx ON marketplace_listings (category_id);
