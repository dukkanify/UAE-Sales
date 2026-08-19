-- Authoritative production user table for Sooqna authentication.
-- Apply automatically on Postgres connect. Do not drop or truncate.
-- Existing rows are never overwritten by JSON import (ON CONFLICT DO NOTHING).

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  normalized_email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  account_status TEXT NOT NULL,
  account_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_users_email_idx ON auth_users (normalized_email);
CREATE INDEX IF NOT EXISTS auth_users_status_idx ON auth_users (account_status);
