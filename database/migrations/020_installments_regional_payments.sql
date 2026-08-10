-- CR003: Installments & regional BNPL (Tamara / Tabby)

CREATE TABLE IF NOT EXISTS public.regional_payment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,
  country_name TEXT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'KWD',
  allow_full_payment BOOLEAN NOT NULL DEFAULT TRUE,
  allow_installments BOOLEAN NOT NULL DEFAULT FALSE,
  bnpl_providers TEXT[] NOT NULL DEFAULT '{}',
  max_installments INTEGER NOT NULL DEFAULT 4,
  min_amount BIGINT NOT NULL DEFAULT 0,
  requires_passport BOOLEAN NOT NULL DEFAULT FALSE,
  requires_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country_code)
);

CREATE TABLE IF NOT EXISTS public.installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  course_ids UUID[] NOT NULL DEFAULT '{}',
  country_code CHAR(2) NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  currency CHAR(3) NOT NULL,
  total_amount BIGINT NOT NULL,
  installment_count INTEGER NOT NULL,
  agreement_accepted_at TIMESTAMPTZ,
  agreement_version TEXT,
  passport_document_id UUID,
  suspended_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS installment_plans_student_idx ON public.installment_plans (student_id);
CREATE INDEX IF NOT EXISTS installment_plans_status_idx ON public.installment_plans (status);

CREATE TABLE IF NOT EXISTS public.installment_schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.installment_plans(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  amount BIGINT NOT NULL,
  currency CHAR(3) NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_id UUID,
  reminder_sent_at TEXT[] NOT NULL DEFAULT '{}',
  last_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS installment_schedule_plan_idx ON public.installment_schedule_items (plan_id);
CREATE INDEX IF NOT EXISTS installment_schedule_due_idx ON public.installment_schedule_items (due_at);

CREATE TABLE IF NOT EXISTS public.student_kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'passport',
  status TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS student_kyc_user_idx ON public.student_kyc_documents (user_id);
