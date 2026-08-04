-- AEP 004 — Database optimization for platform settings & observability
-- Indexes, soft-delete readiness, cascade rules, naming conventions

-- Settings category lookup
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings (category);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON public.settings (updated_at DESC);

-- Audit / activity composite indexes for Super Admin filters
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_created
  ON public.activity_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_created
  ON public.activity_logs (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_created
  ON public.audit_logs (resource, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created
  ON public.audit_logs (action, created_at DESC);

-- Sessions: active session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_active
  ON public.sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;

-- Notifications unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

-- Soft-delete columns (nullable deleted_at) for future modules
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NULL;

-- Feature flags / extended platform settings seeds
INSERT INTO public.settings (key, value, category, description) VALUES
  ('platform.name', '"ATPL PASS"', 'general', 'Platform display name'),
  ('platform.company_name', '"ATPL PASS"', 'general', 'Legal company name'),
  ('platform.contact_email', '"ME@ABDULAZIZALSHOAIL.COM"', 'general', 'Primary contact email'),
  ('platform.support_email', '"ME@ABDULAZIZALSHOAIL.COM"', 'general', 'Support email'),
  ('platform.locations', '["Kuwait","Dubai"]', 'general', 'Primary locations'),
  ('platform.social_handle', '"@ABDULAZIZ_ALSHOAIL"', 'general', 'Official social handle'),
  ('platform.maintenance', 'false', 'general', 'Maintenance mode flag'),
  ('platform.language', '"en"', 'localization', 'Default language (English only in V1)'),
  ('branding.logo_url', '"/brand/logo.svg"', 'branding', 'Primary logo path'),
  ('branding.favicon_url', '"/brand/favicon.svg"', 'branding', 'Favicon path'),
  ('branding.primary_color', '"#0B1F3A"', 'branding', 'Interim primary color'),
  ('branding.accent_color', '"#38BDF8"', 'branding', 'Interim accent color'),
  ('branding.guidelines_pending', 'true', 'branding', 'Official guidelines pending from client'),
  ('features.blog', 'false', 'features', 'Blog module flag'),
  ('features.communities', 'false', 'features', 'Communities module flag'),
  ('features.certificates', 'false', 'features', 'Certificates module flag'),
  ('features.payments', 'false', 'features', 'Payments module flag'),
  ('features.zoom', 'false', 'features', 'Zoom module flag'),
  ('features.advertisements', 'false', 'features', 'Ads module flag'),
  ('features.courses', 'false', 'features', 'Courses module flag'),
  ('features.calendar', 'false', 'features', 'Calendar module flag'),
  ('email.sender_email', '"ME@ABDULAZIZALSHOAIL.COM"', 'email', 'Default sender email'),
  ('security.max_upload_mb', '10', 'security', 'Max upload size in MB'),
  ('storage.provider', '"local"', 'storage', 'Storage provider')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      updated_at = NOW();
