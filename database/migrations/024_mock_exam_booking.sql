-- =============================================================================
-- CR007 — Mock Exam Booking System (independent module)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mock_exam_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  currency text NOT NULL DEFAULT 'KWD',
  timezone text NOT NULL DEFAULT 'Asia/Kuwait',
  pricing_mode text NOT NULL DEFAULT 'dynamic',
  peak_start_hour smallint NOT NULL DEFAULT 16,
  peak_end_hour smallint NOT NULL DEFAULT 21,
  slot_step_minutes integer NOT NULL DEFAULT 60,
  buffer_minutes integer NOT NULL DEFAULT 15,
  max_advance_days integer NOT NULL DEFAULT 30,
  min_notice_minutes integer NOT NULL DEFAULT 120,
  auto_create_zoom boolean NOT NULL DEFAULT true,
  auto_issue_certificate boolean NOT NULL DEFAULT true,
  tax_rate_percent numeric NOT NULL DEFAULT 0,
  working_hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  blackout_dates jsonb NOT NULL DEFAULT '[]'::jsonb,
  examiner_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mock_exam_types (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL,
  base_price integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  peak_multiplier numeric NOT NULL DEFAULT 1.25,
  off_peak_multiplier numeric NOT NULL DEFAULT 0.9
);

CREATE TABLE IF NOT EXISTS public.mock_exam_extra_fees (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  amount integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  auto_apply boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.mock_exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type_id text NOT NULL REFERENCES public.mock_exam_types(id),
  exam_type_name text NOT NULL,
  student_id uuid NOT NULL REFERENCES public.users(id),
  examiner_id uuid NOT NULL REFERENCES public.users(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  status text NOT NULL,
  timezone text NOT NULL,
  currency text NOT NULL,
  quote jsonb NOT NULL,
  selected_extra_fee_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  zoom jsonb NULL,
  certificate_id uuid NULL,
  score_percent numeric NULL,
  passed boolean NULL,
  completion_notes text NULL,
  paid_at timestamptz NULL,
  completed_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  cancel_reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mock_exam_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.mock_exam_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.users(id),
  student_name text NOT NULL,
  exam_type_name text NOT NULL,
  score_percent numeric NULL,
  passed boolean NOT NULL,
  verification_code text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL,
  html_snapshot text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mock_exam_sessions_student
  ON public.mock_exam_sessions (student_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_mock_exam_sessions_examiner
  ON public.mock_exam_sessions (examiner_id, starts_at DESC);

INSERT INTO public.permissions (key, name, module, description) VALUES
  ('mock_exams.own', 'Own Mock Exams', 'mock_exams', 'Book and view own mock exams'),
  ('mock_exams.manage', 'Manage Mock Exams', 'mock_exams', 'Invigilate and complete mock exams'),
  ('mock_exams.config', 'Configure Mock Exams', 'mock_exams', 'Admin configuration for mock exams')
ON CONFLICT (key) DO NOTHING;
