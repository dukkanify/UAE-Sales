-- =============================================================================
-- AEP Migration 025 — Dynamic Schedule Management (CR008)
-- Extends Live Classes + ATPL lecture distribution for schedule orchestration.
-- Runtime store remains JSON (.data); this documents the durable shape.
-- =============================================================================

-- Lecture assignment may be cancelled when the linked session is cancelled.
DO $$ BEGIN
  ALTER TYPE atpl_lecture_distribution_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Optional schedule event log for timeline analytics (future SQL path).
CREATE TABLE IF NOT EXISTS schedule_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id UUID REFERENCES live_classes(id) ON DELETE SET NULL,
  lecture_assignment_id UUID,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'live_course',
  status TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_timeline_occurred
  ON schedule_timeline_events(occurred_at DESC);

COMMENT ON TABLE schedule_timeline_events IS
  'CR008 Dynamic Schedule Management — timeline projection for Live + ATPL sessions';
