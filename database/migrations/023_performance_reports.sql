-- =============================================================================
-- CR006 — Post-lecture student performance reports
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id uuid NOT NULL,
  class_title text NOT NULL,
  course_id uuid NULL,
  course_code text NULL,
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.users(id),
  todays_topic text NOT NULL,
  next_topic text NOT NULL,
  homework text NOT NULL,
  performance text NOT NULL CHECK (
    performance IN (
      'excellent',
      'good',
      'satisfactory',
      'needs_improvement',
      'unsatisfactory'
    )
  ),
  question_bank text NOT NULL,
  comments text NOT NULL DEFAULT '',
  email_sent_at timestamptz NULL,
  email_outbox_id text NULL,
  created_by_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (live_class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_performance_reports_student
  ON public.performance_reports (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reports_instructor
  ON public.performance_reports (instructor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reports_class
  ON public.performance_reports (live_class_id);

INSERT INTO public.permissions (key, name, module, description) VALUES
  (
    'performance.reports',
    'Performance Reports',
    'reports',
    'Submit and view post-lecture student performance reports'
  )
ON CONFLICT (key) DO NOTHING;
