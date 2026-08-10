-- =============================================================================
-- AEP Migration 026 — Advanced Email Automation (CR009)
-- Documents durable automation logging alongside the JSON outbox.
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_mode TEXT NOT NULL,
  outbox_id UUID,
  error TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_automation_event
  ON email_automation_logs(event, created_at DESC);

CREATE TABLE IF NOT EXISTS email_automation_disabled_events (
  event TEXT PRIMARY KEY,
  disabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disabled_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE email_automation_logs IS
  'CR009 Advanced Email Automation — dispatch audit for lifecycle emails';
