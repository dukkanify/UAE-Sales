-- =============================================================================
-- AEP 030 — Enterprise notification system extensions
-- Priority, status, archive, grouping, action URL, dedupe
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.notification_priority AS ENUM (
    'critical', 'high', 'medium', 'low', 'informational'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_status AS ENUM (
    'unread', 'read', 'archived', 'deleted'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS priority public.notification_priority DEFAULT 'informational',
  ADD COLUMN IF NOT EXISTS status public.notification_status DEFAULT 'unread',
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS group_key TEXT,
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS notifications_user_status_idx
  ON public.notifications (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_group_idx
  ON public.notifications (user_id, group_key, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS notifications_dedupe_idx
  ON public.notifications (user_id, dedupe_key, created_at DESC)
  WHERE dedupe_key IS NOT NULL;
