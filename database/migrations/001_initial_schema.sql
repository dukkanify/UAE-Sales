-- =============================================================================
-- Aviation Education Platform (AEP) — Initial Database Schema
-- PostgreSQL + Supabase (Auth, RLS, Storage-ready)
-- =============================================================================

-- Roles enum
CREATE TYPE public.user_role AS ENUM (
  'student',
  'instructor',
  'admin',
  'super_admin'
);

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  role          public.user_role NOT NULL DEFAULT 'student',
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_role_idx ON public.profiles (role);
CREATE INDEX profiles_email_idx ON public.profiles (email);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'student'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================================================
-- Storage bucket (run via Supabase dashboard or storage API)
-- Bucket name: aep-uploads
-- Policies should restrict uploads to authenticated users under their own folder.
-- =============================================================================
