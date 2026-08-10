-- =============================================================================
-- CR005 — Instructor Assignment Engine (ATPL journey)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.instructor_availability_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.instructor_availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text NOT NULL DEFAULT 'Unavailable',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('assign', 'reassign', 'schedule_session')),
  course_id uuid NOT NULL,
  lesson_id uuid NULL,
  lesson_title text NOT NULL,
  student_id uuid NULL,
  instructor_id uuid NOT NULL REFERENCES public.users(id),
  previous_instructor_id uuid NULL,
  preferred_starts_at timestamptz NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL CHECK (
    status IN (
      'scheduling_required',
      'queued',
      'scheduled',
      'unable_to_schedule',
      'cancelled'
    )
  ),
  live_class_id uuid NULL,
  zoom_meeting_id text NULL,
  conflict_summary text NULL,
  queue_position integer NULL,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  auto_zoom boolean NOT NULL DEFAULT true,
  notes text NULL,
  unable_reason text NULL,
  created_by_id uuid NULL,
  scheduled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_waiting_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_request_id uuid NOT NULL REFERENCES public.assignment_requests(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.users(id),
  course_id uuid NOT NULL,
  preferred_starts_at timestamptz NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  priority bigint NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (
    status IN ('waiting', 'processing', 'fulfilled', 'failed', 'cancelled')
  ),
  enqueued_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz NULL,
  failure_reason text NULL
);

CREATE INDEX IF NOT EXISTS idx_assignment_requests_instructor
  ON public.assignment_requests (instructor_id, status);
CREATE INDEX IF NOT EXISTS idx_assignment_queue_waiting
  ON public.assignment_waiting_queue (instructor_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_availability_windows_instructor
  ON public.instructor_availability_windows (instructor_id, weekday);

INSERT INTO public.permissions (key, name, module, description) VALUES
  ('assignment.engine', 'Assignment Engine', 'atpl', 'Operate instructor assignment engine')
ON CONFLICT (key) DO NOTHING;
