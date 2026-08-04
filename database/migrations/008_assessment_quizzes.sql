-- =============================================================================
-- AEP Migration 008 — Assessment System, Quiz Engine, Question Bank
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM (
    'multiple_choice_single',
    'multiple_choice_multiple',
    'true_false',
    'fill_blank',
    'short_answer',
    'essay',
    'matching',
    'ordering'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attempt_status AS ENUM ('in_progress', 'submitted', 'graded', 'abandoned', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE grade_status AS ENUM ('pending', 'auto_graded', 'needs_review', 'final');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS question_bank_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL DEFAULT 'General',
  module_label TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES question_bank_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stem TEXT NOT NULL,
  type question_type NOT NULL,
  difficulty question_difficulty NOT NULL DEFAULT 'medium',
  category_id UUID REFERENCES question_bank_categories(id) ON DELETE SET NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  module_label TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB,
  explanation TEXT NOT NULL DEFAULT '',
  points NUMERIC(8,2) NOT NULL DEFAULT 1,
  external_id TEXT,
  external_source TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bank_questions_search ON bank_questions USING GIN (to_tsvector('english', stem));
CREATE INDEX IF NOT EXISTS idx_bank_questions_tags ON bank_questions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_bank_questions_external ON bank_questions(external_source, external_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  course_id UUID,
  module_id UUID,
  lesson_id UUID,
  status quiz_status NOT NULL DEFAULT 'draft',
  passing_score NUMERIC(5,2) NOT NULL DEFAULT 70,
  total_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
  time_limit_minutes INT,
  max_attempts INT NOT NULL DEFAULT 1,
  random_questions BOOLEAN NOT NULL DEFAULT FALSE,
  random_answers BOOLEAN NOT NULL DEFAULT FALSE,
  negative_marking BOOLEAN NOT NULL DEFAULT FALSE,
  negative_mark_value NUMERIC(6,2) NOT NULL DEFAULT 0,
  show_results_immediately BOOLEAN NOT NULL DEFAULT TRUE,
  review_answers BOOLEAN NOT NULL DEFAULT TRUE,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  auto_submit_on_expiry BOOLEAN NOT NULL DEFAULT TRUE,
  allow_resume BOOLEAN NOT NULL DEFAULT TRUE,
  prevent_duplicate_attempts BOOLEAN NOT NULL DEFAULT TRUE,
  question_count INT,
  instructions TEXT NOT NULL DEFAULT '',
  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES bank_questions(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  points_override NUMERIC(8,2),
  UNIQUE (quiz_id, question_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  status attempt_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  score NUMERIC(10,2),
  max_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  percent NUMERIC(6,2),
  passed BOOLEAN,
  grade_status grade_status NOT NULL DEFAULT 'pending',
  question_ids UUID[] NOT NULL DEFAULT '{}',
  last_saved_at TIMESTAMPTZ,
  client_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  suspicious_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id, quiz_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_active
  ON quiz_attempts(quiz_id, student_id)
  WHERE status = 'in_progress';

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES bank_questions(id) ON DELETE CASCADE,
  response JSONB,
  is_correct BOOLEAN,
  auto_score NUMERIC(8,2),
  manual_score NUMERIC(8,2),
  final_score NUMERIC(8,2),
  needs_manual_grading BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT NOT NULL DEFAULT '',
  graded_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS instructor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comments TEXT NOT NULL DEFAULT '',
  score_adjustment NUMERIC(8,2) NOT NULL DEFAULT 0,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id)
);

-- assessment_analytics is derived; optional materialized snapshot table for reporting caches
CREATE TABLE IF NOT EXISTS assessment_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
