-- =============================================================================
-- AEP 002 — Seed permissions, role_permissions, countries, default settings
-- =============================================================================

-- Permissions catalog
INSERT INTO public.permissions (key, name, module, description) VALUES
  -- Super Admin / System
  ('system.settings', 'System Settings', 'system', 'Manage platform system settings'),
  ('system.security', 'Security Settings', 'system', 'Manage security configuration'),
  ('system.email', 'Email Settings', 'system', 'Configure email providers'),
  ('system.zoom', 'Zoom Settings', 'system', 'Configure Zoom integration'),
  ('system.payments', 'Payment Settings', 'system', 'Configure payment providers'),
  ('finance.reports', 'Financial Reports', 'finance', 'View financial reports'),
  ('finance.wallets', 'Instructor Wallets', 'finance', 'Manage instructor wallets'),
  ('users.manage_admins', 'Manage Admins', 'users', 'Create and delete admin accounts'),
  ('users.manage_all', 'Manage All Users', 'users', 'Full user management'),
  ('dashboard.super_admin', 'Super Admin Dashboard', 'dashboard', 'Access super admin dashboard'),
  ('audit.read', 'Read Audit Logs', 'audit', 'View audit and activity logs'),

  -- Admin
  ('students.manage', 'Manage Students', 'users', 'Create, update, suspend students'),
  ('instructors.manage', 'Manage Instructors', 'users', 'Create, update, suspend instructors'),
  ('courses.manage', 'Manage Courses', 'courses', 'Create and manage courses'),
  ('classes.manage', 'Manage Classes', 'classes', 'Manage class schedules'),
  ('communities.moderate', 'Moderate Communities', 'community', 'Moderate community content'),
  ('reports.view', 'View Reports', 'reports', 'View operational reports'),
  ('blog.manage', 'Manage Blog', 'blog', 'Manage blog content'),
  ('calendar.manage', 'Manage Calendar', 'calendar', 'Manage platform calendar'),
  ('dashboard.admin', 'Admin Dashboard', 'dashboard', 'Access admin dashboard'),

  -- Instructor
  ('dashboard.instructor', 'Instructor Dashboard', 'dashboard', 'Access instructor dashboard'),
  ('courses.own', 'My Courses', 'courses', 'View and manage own courses'),
  ('students.own', 'My Students', 'users', 'View assigned students'),
  ('schedule.own', 'My Schedule', 'calendar', 'View personal schedule'),
  ('zoom.sessions', 'Zoom Sessions', 'zoom', 'Manage Zoom teaching sessions'),
  ('attendance.manage', 'Attendance', 'classes', 'Take and view attendance'),
  ('quizzes.manage', 'Quizzes', 'assessments', 'Create and grade quizzes'),
  ('assignments.manage', 'Assignments', 'assessments', 'Create and grade assignments'),
  ('wallet.own', 'Wallet', 'finance', 'View personal wallet'),
  ('earnings.own', 'Earnings', 'finance', 'View personal earnings'),
  ('reports.own', 'Own Reports', 'reports', 'View personal teaching reports'),
  ('profile.own', 'Own Profile', 'profile', 'View and update own profile'),

  -- Student
  ('dashboard.student', 'Student Dashboard', 'dashboard', 'Access student dashboard'),
  ('courses.enrolled', 'Enrolled Courses', 'courses', 'Access enrolled courses'),
  ('calendar.own', 'Own Calendar', 'calendar', 'View personal calendar'),
  ('zoom.classes', 'Zoom Classes', 'zoom', 'Join Zoom classes'),
  ('assignments.own', 'Own Assignments', 'assessments', 'Submit assignments'),
  ('quizzes.own', 'Own Quizzes', 'assessments', 'Take quizzes'),
  ('certificates.own', 'Own Certificates', 'certificates', 'View certificates'),
  ('notifications.own', 'Own Notifications', 'notifications', 'View notifications'),
  ('community.access', 'Community Access', 'community', 'Access community features')
ON CONFLICT (key) DO NOTHING;

-- Map permissions to roles
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
  -- Super Admin: everything
  (rm.role_key = 'super_admin')
  OR
  -- Admin
  (rm.role_key = 'admin' AND p.key IN (
    'students.manage', 'instructors.manage', 'courses.manage', 'classes.manage',
    'communities.moderate', 'reports.view', 'blog.manage', 'calendar.manage',
    'dashboard.admin', 'profile.own', 'notifications.own'
  ))
  OR
  -- Instructor
  (rm.role_key = 'instructor' AND p.key IN (
    'dashboard.instructor', 'courses.own', 'students.own', 'schedule.own',
    'zoom.sessions', 'attendance.manage', 'quizzes.manage', 'assignments.manage',
    'wallet.own', 'earnings.own', 'reports.own', 'profile.own', 'notifications.own'
  ))
  OR
  -- Student
  (rm.role_key = 'student' AND p.key IN (
    'dashboard.student', 'courses.enrolled', 'calendar.own', 'zoom.classes',
    'assignments.own', 'quizzes.own', 'certificates.own', 'notifications.own',
    'community.access', 'profile.own'
  ))
ON CONFLICT DO NOTHING;

-- Countries (sample seed — expand as needed)
INSERT INTO public.countries (code, name, dial_code) VALUES
  ('AE', 'United Arab Emirates', '+971'),
  ('SA', 'Saudi Arabia', '+966'),
  ('EG', 'Egypt', '+20'),
  ('JO', 'Jordan', '+962'),
  ('US', 'United States', '+1'),
  ('GB', 'United Kingdom', '+44'),
  ('IN', 'India', '+91'),
  ('PK', 'Pakistan', '+92'),
  ('CA', 'Canada', '+1'),
  ('AU', 'Australia', '+61'),
  ('DE', 'Germany', '+49'),
  ('FR', 'France', '+33'),
  ('TR', 'Turkey', '+90'),
  ('QA', 'Qatar', '+974'),
  ('KW', 'Kuwait', '+965'),
  ('BH', 'Bahrain', '+973'),
  ('OM', 'Oman', '+968')
ON CONFLICT (code) DO NOTHING;

-- Default settings
INSERT INTO public.settings (key, value, category, description) VALUES
  ('auth.otp_expiry_minutes', '10', 'auth', 'OTP code expiry in minutes'),
  ('auth.session_days', '7', 'auth', 'Default session length in days'),
  ('auth.remember_me_days', '30', 'auth', 'Remember-me session length in days'),
  ('auth.max_otp_attempts', '5', 'auth', 'Max OTP verification attempts'),
  ('platform.name', '"Eager Pilots"', 'general', 'Platform display name'),
  ('platform.maintenance', 'false', 'general', 'Maintenance mode flag')
ON CONFLICT (key) DO NOTHING;
