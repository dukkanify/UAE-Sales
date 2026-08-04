-- Post-launch support modules (Task 021)
-- Extends 015_support_ops.sql twin for .data/aep-support-ops.json

ALTER TABLE incident_reports
  ADD COLUMN IF NOT EXISTS affected_module TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS root_cause TEXT,
  ADD COLUMN IF NOT EXISTS resolution TEXT,
  ADD COLUMN IF NOT EXISTS preventive_action TEXT;

CREATE TABLE IF NOT EXISTS feature_requests (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  business_value TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_effort_hours NUMERIC,
  estimated_cost NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  development_status TEXT NOT NULL DEFAULT 'not_started',
  requested_by TEXT,
  approved_by TEXT,
  target_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_requests_status_idx
  ON feature_requests(approval_status, priority);

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'internal',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  tags JSONB NOT NULL DEFAULT '[]',
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS knowledge_articles_category_idx
  ON knowledge_articles(category, published);

CREATE TABLE IF NOT EXISTS customer_feedback (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  rating INTEGER,
  title TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  submitter_email TEXT,
  submitter_role TEXT,
  linked_feature_id TEXT,
  linked_bug_id TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_feedback_created_idx
  ON customer_feedback(created_at DESC);

CREATE TABLE IF NOT EXISTS hypercare_periods (
  id TEXT PRIMARY KEY DEFAULT 'current',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  label TEXT NOT NULL DEFAULT 'Post-launch hypercare',
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  watch_modules JSONB NOT NULL DEFAULT '[]',
  check_ins JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS optimization_notes (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  title TEXT NOT NULL,
  finding TEXT NOT NULL DEFAULT '',
  recommended_action TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS optimization_notes_status_idx
  ON optimization_notes(status, area);
