-- Support / production ops twin (Task 017)
-- Complements JSON store: .data/aep-support-ops.json

CREATE TABLE IF NOT EXISTS support_requests (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  channel TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  assignee_id TEXT,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  linked_ticket_id TEXT,
  history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_requests_status_idx ON support_requests(status, priority);
CREATE INDEX IF NOT EXISTS support_requests_created_idx ON support_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS bug_reports (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT 'general',
  reporter_id TEXT,
  assignee_id TEXT,
  resolution TEXT,
  verified_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bug_reports_status_idx ON bug_reports(status, priority);

CREATE TABLE IF NOT EXISTS change_requests (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  business_impact TEXT NOT NULL DEFAULT '',
  estimated_time_hours NUMERIC,
  estimated_cost NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  development_status TEXT NOT NULL DEFAULT 'not_started',
  requested_by TEXT,
  approved_by TEXT,
  future_phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS release_notes (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  highlights JSONB NOT NULL DEFAULT '[]',
  fixes JSONB NOT NULL DEFAULT '[]',
  breaking_changes JSONB NOT NULL DEFAULT '[]',
  deployed_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL,
  status_message TEXT NOT NULL DEFAULT '',
  estimated_return_at TIMESTAMPTZ,
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  actor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  affected_services JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  postmortem TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  target_version TEXT,
  change_request_id TEXT REFERENCES change_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_health_logs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  checks JSONB NOT NULL DEFAULT '[]',
  active_users INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  security_alert_count INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS system_health_logs_captured_idx ON system_health_logs(captured_at DESC);

CREATE TABLE IF NOT EXISTS ops_alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ops_alerts_status_idx ON ops_alerts(status, severity);

CREATE TABLE IF NOT EXISTS backup_verification_reports (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL,
  backup_id TEXT,
  success BOOLEAN NOT NULL,
  integrity_ok BOOLEAN NOT NULL,
  restore_test_ok BOOLEAN,
  notes TEXT NOT NULL DEFAULT '',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by TEXT
);

CREATE TABLE IF NOT EXISTS sla_policies (
  id TEXT PRIMARY KEY DEFAULT 'default',
  critical JSONB NOT NULL,
  high JSONB NOT NULL,
  medium JSONB NOT NULL,
  low JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);
