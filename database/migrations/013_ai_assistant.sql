-- AI Learning Assistant schema (aspirational twin of .data/aep-ai.json)
-- Task 014

CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  persona TEXT NOT NULL,
  title TEXT NOT NULL,
  context_course_id TEXT,
  context_lesson_id TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_conversations_user_idx ON ai_conversations(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  intent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_messages_conversation_idx ON ai_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  persona TEXT NOT NULL,
  action TEXT NOT NULL,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_usage_user_idx ON ai_usage(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  persona TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  intent TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ai_recommendation_history (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  reason TEXT NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  category_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_recommendations_student_idx ON ai_recommendation_history(student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_study_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  horizon TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  editable BOOLEAN NOT NULL DEFAULT TRUE,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_study_plans_student_idx ON ai_study_plans(student_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  persona TEXT NOT NULL,
  action TEXT NOT NULL,
  safe BOOLEAN NOT NULL DEFAULT TRUE,
  blocked_reason TEXT,
  input_preview TEXT NOT NULL DEFAULT '',
  output_preview TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_logs_created_idx ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_logs_user_idx ON ai_logs(user_id, created_at DESC);
