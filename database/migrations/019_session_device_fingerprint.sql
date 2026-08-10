-- Account protection / DRM session metadata (CR002)

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS device_label TEXT;

CREATE INDEX IF NOT EXISTS sessions_device_fingerprint_idx
  ON public.sessions (device_fingerprint)
  WHERE device_fingerprint IS NOT NULL;
