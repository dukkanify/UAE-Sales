-- =============================================================================
-- AEP Migration 027 — Super Admin Automation Center (CR010)
-- =============================================================================

CREATE TABLE IF NOT EXISTS automation_center_prefs (
  id TEXT PRIMARY KEY DEFAULT 'default',
  disabled_domains TEXT[] NOT NULL DEFAULT '{}',
  last_configured_at TIMESTAMPTZ,
  last_configured_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_center_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  patch JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_center_audit_domain
  ON automation_center_audit(domain, created_at DESC);

COMMENT ON TABLE automation_center_prefs IS
  'CR010 Super Admin Automation Center — domain enablement without code changes';
