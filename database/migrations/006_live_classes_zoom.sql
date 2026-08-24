-- =============================================================================
-- AEP Migration 006 — Live Classes, Zoom, Scheduling, Attendance Foundation
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE live_class_status AS ENUM ('draft', 'scheduled', 'live', 'completed', 'cancelled', 'rescheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE meeting_type AS ENUM ('meeting', 'webinar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recurrence_frequency AS ENUM ('once', 'daily', 'weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reminder_channel AS ENUM ('email', 'in_app');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'cancelled', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS recurring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency recurrence_frequency NOT NULL,
  interval_count INT NOT NULL DEFAULT 1,
  by_weekday INT[] NOT NULL DEFAULT '{}',
  occurrence_count INT,
  until_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  course_id UUID,
  module_id UUID,
  lesson_id UUID,
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  assistant_instructor_id UUID REFERENCES profiles(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  max_students INT NOT NULL DEFAULT 30,
  meeting_type meeting_type NOT NULL DEFAULT 'meeting',
  status live_class_status NOT NULL DEFAULT 'scheduled',
  zoom_meeting_row_id UUID,
  recurring_rule_id UUID REFERENCES recurring_rules(id) ON DELETE SET NULL,
  parent_class_id UUID REFERENCES live_classes(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  rescheduled_from_id UUID REFERENCES live_classes(id) ON DELETE SET NULL,
  created_by_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_live_classes_instructor ON live_classes(instructor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_live_classes_starts ON live_classes(starts_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_live_classes_course ON live_classes(course_id);

CREATE TABLE IF NOT EXISTS zoom_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  zoom_meeting_id TEXT NOT NULL,
  zoom_uuid TEXT,
  join_url TEXT NOT NULL,
  start_url TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT '',
  host_email TEXT,
  waiting_room BOOLEAN NOT NULL DEFAULT TRUE,
  passcode_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  co_host_emails TEXT[] NOT NULL DEFAULT '{}',
  provider_mode TEXT NOT NULL DEFAULT 'mock',
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (live_class_id)
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('host', 'cohost', 'participant')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE (live_class_id, user_id)
);

CREATE TABLE IF NOT EXISTS class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'unknown',
  join_time TIMESTAMPTZ,
  leave_time TIMESTAMPTZ,
  duration_seconds INT NOT NULL DEFAULT 0,
  attendance_percent INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (live_class_id, student_id)
);

CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  zoom_meeting_id TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'video/mp4',
  file_size_bytes BIGINT,
  duration_seconds INT,
  available_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  instructor_access BOOLEAN NOT NULL DEFAULT TRUE,
  student_access BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  channel reminder_channel NOT NULL DEFAULT 'in_app',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status reminder_status NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_queue_due ON reminder_queue(scheduled_for) WHERE status = 'pending';

ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_queue ENABLE ROW LEVEL SECURITY;

INSERT INTO settings (key, value, category, description)
VALUES
  ('features.zoom', 'true', 'features', 'Zoom / live classes'),
  ('features.calendar', 'true', 'features', 'Platform calendar')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
