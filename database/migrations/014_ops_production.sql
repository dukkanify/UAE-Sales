-- Ops / production readiness twin (Task 015)
-- Complements JSON stores: aep-ops-logs.json, .backups/

CREATE TABLE IF NOT EXISTS ops_logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  path TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ops_logs_created_idx ON ops_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ops_logs_category_idx ON ops_logs(category, created_at DESC);

CREATE TABLE IF NOT EXISTS backup_manifests (
  id TEXT PRIMARY KEY,
  retention TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  files JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  restore_tested_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS health_check_snapshots (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  checks JSONB NOT NULL DEFAULT '[]',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS download_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS download_tokens_expires_idx ON download_tokens(expires_at);
