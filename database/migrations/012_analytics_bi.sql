-- Analytics / BI schema (aspirational twin of .data/aep-analytics.json)
-- Task 013

CREATE TABLE IF NOT EXISTS analytics_cache (
  key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_cache_expires_idx ON analytics_cache(expires_at);

CREATE TABLE IF NOT EXISTS kpi_metrics (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  label TEXT NOT NULL,
  value_numeric DOUBLE PRECISION,
  value_text TEXT,
  unit TEXT,
  format TEXT NOT NULL DEFAULT 'number',
  filters JSONB NOT NULL DEFAULT '{}',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kpi_metrics_scope_idx ON kpi_metrics(scope, captured_at DESC);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  chart_id TEXT,
  kpi_ids JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dashboard_widgets_user_idx ON dashboard_widgets(user_id);

CREATE TABLE IF NOT EXISTS user_dashboard_prefs (
  user_id TEXT PRIMARY KEY,
  saved_filters JSONB NOT NULL DEFAULT '[]',
  favorite_dashboard_ids JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  scope TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_by_id TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_reports_user_idx ON saved_reports(created_by_id);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  scope TEXT NOT NULL,
  frequency TEXT NOT NULL,
  recipients JSONB NOT NULL DEFAULT '[]',
  filters JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id TEXT NOT NULL,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scheduled_reports_next_idx ON scheduled_reports(next_run_at)
  WHERE enabled = TRUE;

CREATE TABLE IF NOT EXISTS report_history (
  id TEXT PRIMARY KEY,
  report_name TEXT NOT NULL,
  scope TEXT NOT NULL,
  format TEXT NOT NULL,
  generated_by_id TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  row_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS report_history_created_idx ON report_history(created_at DESC);

CREATE TABLE IF NOT EXISTS system_metrics (
  id TEXT PRIMARY KEY,
  online_users INTEGER NOT NULL DEFAULT 0,
  api_response_ms INTEGER,
  storage_mb DOUBLE PRECISION,
  system_errors_24h INTEGER NOT NULL DEFAULT 0,
  failed_jobs INTEGER NOT NULL DEFAULT 0,
  email_queue INTEGER NOT NULL DEFAULT 0,
  notification_queue INTEGER NOT NULL DEFAULT 0,
  zoom_status TEXT,
  warnings JSONB NOT NULL DEFAULT '[]',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_metrics (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  enrollments INTEGER NOT NULL DEFAULT 0,
  completion_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  avg_learning_seconds INTEGER NOT NULL DEFAULT 0,
  avg_quiz_score DOUBLE PRECISION,
  attendance_rate DOUBLE PRECISION,
  drop_off_rate DOUBLE PRECISION,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS learning_metrics_course_idx ON learning_metrics(course_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS financial_metrics (
  id TEXT PRIMARY KEY,
  currency TEXT NOT NULL,
  revenue_minor INTEGER NOT NULL DEFAULT 0,
  monthly_revenue_minor INTEGER NOT NULL DEFAULT 0,
  annual_revenue_minor INTEGER NOT NULL DEFAULT 0,
  aov_minor INTEGER NOT NULL DEFAULT 0,
  refund_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  outstanding_payouts_minor INTEGER NOT NULL DEFAULT 0,
  by_course JSONB NOT NULL DEFAULT '[]',
  by_instructor JSONB NOT NULL DEFAULT '[]',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materialized-style daily executive snapshot (refresh via job)
CREATE TABLE IF NOT EXISTS mv_executive_daily (
  day DATE PRIMARY KEY,
  total_students INTEGER NOT NULL,
  active_students INTEGER NOT NULL,
  new_students INTEGER NOT NULL,
  active_courses INTEGER NOT NULL,
  live_classes INTEGER NOT NULL,
  revenue_minor INTEGER NOT NULL,
  completion_rate DOUBLE PRECISION NOT NULL,
  engagement DOUBLE PRECISION NOT NULL,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
