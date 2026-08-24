-- =============================================================================
-- AEP Migration 009 — Certificates, Progress, Transcripts & Academic Reports
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE certificate_status AS ENUM (
    'draft', 'pending_approval', 'issued', 'revoked', 'expired', 'reissued'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE certificate_issue_mode AS ENUM ('automatic', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  logo_url TEXT,
  background_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0B1F33',
  accent_color TEXT NOT NULL DEFAULT '#C5A46E',
  signature_name TEXT NOT NULL DEFAULT '',
  signature_title TEXT NOT NULL DEFAULT '',
  signature_image_url TEXT,
  body_html TEXT NOT NULL,
  fields TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT NOT NULL UNIQUE,
  verification_code TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  course_id UUID,
  course_name TEXT NOT NULL,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  instructor_name TEXT NOT NULL DEFAULT '',
  template_id UUID NOT NULL REFERENCES certificate_templates(id),
  status certificate_status NOT NULL DEFAULT 'draft',
  issue_mode certificate_issue_mode NOT NULL DEFAULT 'manual',
  completion_date DATE NOT NULL,
  issue_date DATE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  reissued_from_id UUID REFERENCES certificates(id) ON DELETE SET NULL,
  digital_signature TEXT NOT NULL,
  qr_payload TEXT NOT NULL,
  approved_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_verify ON certificates(verification_code);

CREATE TABLE IF NOT EXISTS completion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  progress_percent NUMERIC(6,2) NOT NULL DEFAULT 100,
  learning_hours NUMERIC(8,1) NOT NULL DEFAULT 0,
  certificate_id UUID REFERENCES certificates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  subject_id TEXT,
  payload JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcript_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  format TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert certificates.manage permission if permissions table exists
INSERT INTO permissions (key, module, description)
SELECT 'certificates.manage', 'assessments', 'Manage certificates and templates'
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions')
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE key = 'certificates.manage');
