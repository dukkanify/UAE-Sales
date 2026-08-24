-- =============================================================================
-- AEP Migration 005 — Course Management / LMS Core
-- Course → Modules → Lessons → Resources, categories, enrollments, progress
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft', 'published', 'private', 'scheduled', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_mode AS ENUM ('open', 'private', 'invitation', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'dropped', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM ('pdf', 'ppt', 'doc', 'image', 'audio', 'link', 'zip', 'video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE instructor_role AS ENUM ('primary', 'assistant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Categories (nested via parent_id; metadata jsonb for future expansion)
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES course_categories(id) ON DELETE SET NULL,
  icon TEXT NOT NULL DEFAULT 'Folder',
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_categories_parent ON course_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_course_categories_visible ON course_categories(visible);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL,
  category_id UUID REFERENCES course_categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  preview_video_url TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'intermediate',
  language TEXT NOT NULL DEFAULT 'en',
  estimated_duration_minutes INT NOT NULL DEFAULT 0,
  enrollment_mode enrollment_mode NOT NULL DEFAULT 'manual',
  status course_status NOT NULL DEFAULT 'draft',
  scheduled_publish_at TIMESTAMPTZ,
  primary_instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  CONSTRAINT courses_code_unique_active UNIQUE NULLS NOT DISTINCT (code, deleted_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_code_active
  ON courses (code) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(primary_instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_updated ON courses(updated_at DESC);

-- Instructors (primary + assistants; multi-instructor ready)
CREATE TABLE IF NOT EXISTS course_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role instructor_role NOT NULL DEFAULT 'assistant',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_course_instructors_user ON course_instructors(user_id);

-- Modules
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  estimated_duration_minutes INT NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id, sort_order);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  duration_minutes INT NOT NULL DEFAULT 0,
  estimated_study_minutes INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  preview_available BOOLEAN NOT NULL DEFAULT FALSE,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);

-- Lesson resources
CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type resource_type NOT NULL,
  url TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  downloadable BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id, sort_order);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'pending',
  enrolled_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dropped_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_active_unique
  ON enrollments (course_id, student_id)
  WHERE status NOT IN ('dropped', 'rejected');

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON enrollments(course_id, status);

-- Progress foundation
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id, course_id);

-- RLS
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Storage bucket note: use aep-uploads with prefix courses/

-- Feature flag
INSERT INTO settings (key, value, category, description)
VALUES ('features.courses', 'true', 'features', 'Courses / LMS core module')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
