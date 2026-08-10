-- =============================================================================
-- CR004 — Chief Ground Instructor role + ATPL journey permissions
-- =============================================================================

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'chief_ground_instructor';

INSERT INTO public.roles (key, name, description)
VALUES (
  'chief_ground_instructor',
  'Chief Ground Instructor',
  'ATPL journey orchestration — subjects, lectures, instructors, schedule, student follow-up'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.permissions (key, name, module, description) VALUES
  ('dashboard.cgi', 'CGI Dashboard', 'dashboard', 'Access Chief Ground Instructor dashboard'),
  ('subjects.distribute', 'Distribute Subjects', 'atpl', 'Distribute ATPL subjects to students'),
  ('lectures.distribute', 'Distribute Lectures', 'atpl', 'Assign lectures to instructors'),
  ('instructors.assign', 'Assign Instructors', 'atpl', 'Change subject / class instructors'),
  ('schedule.manage_all', 'Manage All Schedules', 'calendar', 'Reschedule any live class'),
  ('atpl.first_subject', 'Choose First Subject', 'atpl', 'Select opening ATPL subject'),
  ('students.follow_all', 'Follow All Students', 'users', 'Monitor all ATPL students'),
  ('instructors.follow', 'Follow Instructors', 'users', 'Monitor all instructors')
ON CONFLICT (key) DO NOTHING;

WITH role_map AS (
  SELECT r.id AS role_id, r.key AS role_key FROM public.roles r
),
perm AS (
  SELECT id, key FROM public.permissions
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT rm.role_id, p.id
FROM role_map rm
CROSS JOIN perm p
WHERE
  (
    rm.role_key = 'chief_ground_instructor'
    AND p.key IN (
      'dashboard.cgi', 'dashboard.instructor', 'courses.own', 'students.own', 'schedule.own',
      'zoom.sessions', 'attendance.manage', 'quizzes.manage', 'assignments.manage',
      'reports.own', 'reports.view', 'profile.own', 'notifications.own',
      'classes.manage', 'calendar.manage',
      'subjects.distribute', 'lectures.distribute', 'instructors.assign',
      'schedule.manage_all', 'atpl.first_subject', 'students.follow_all', 'instructors.follow'
    )
  )
  OR (
    rm.role_key = 'admin'
    AND p.key IN (
      'dashboard.cgi', 'subjects.distribute', 'lectures.distribute', 'instructors.assign',
      'schedule.manage_all', 'atpl.first_subject', 'students.follow_all', 'instructors.follow'
    )
  )
  OR (rm.role_key = 'super_admin')
ON CONFLICT DO NOTHING;
