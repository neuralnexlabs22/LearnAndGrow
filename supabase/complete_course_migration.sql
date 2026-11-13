-- =============================================================================
-- LEARN AND GROW: COMPLETE SPOKEN ENGLISH COURSE MIGRATION SCRIPT
-- Run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- =============================================================================

-- 1. Create Complete Course Settings Table (with Pricing & Offer fields)
CREATE TABLE IF NOT EXISTS public.complete_course_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT NOT NULL DEFAULT 'Complete Spoken English Course',
  description TEXT NOT NULL DEFAULT 'Get access to the complete English learning course, including all learning materials and additional resources provided by Learn and Grow.',
  cover_image_url TEXT,
  total_resources INT NOT NULL DEFAULT 0,
  original_price NUMERIC NOT NULL DEFAULT 14999,
  selling_price NUMERIC NOT NULL DEFAULT 4999,
  currency TEXT NOT NULL DEFAULT '₹',
  discount_percent INT DEFAULT 67,
  offer_tag TEXT DEFAULT 'COMPLETE MASTERY PACK',
  is_offer_active BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure pricing columns exist if table was previously created without them
ALTER TABLE public.complete_course_settings 
  ADD COLUMN IF NOT EXISTS original_price NUMERIC NOT NULL DEFAULT 14999,
  ADD COLUMN IF NOT EXISTS selling_price NUMERIC NOT NULL DEFAULT 4999,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT '₹',
  ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 67,
  ADD COLUMN IF NOT EXISTS offer_tag TEXT DEFAULT 'COMPLETE MASTERY PACK',
  ADD COLUMN IF NOT EXISTS is_offer_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Create Complete Course Resources Table (PDFs, Word Documents, External Links)
CREATE TABLE IF NOT EXISTS public.complete_course_resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'doc', 'link')),
  file_name TEXT,
  file_storage_path TEXT,
  file_size_bytes BIGINT,
  external_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_complete_resources_order ON public.complete_course_resources(order_index);
CREATE INDEX IF NOT EXISTS idx_complete_resources_published ON public.complete_course_resources(is_published);
CREATE INDEX IF NOT EXISTS idx_complete_resources_type ON public.complete_course_resources(resource_type);

-- 3. Create Independent Complete Course Access Entitlement Table
CREATE TABLE IF NOT EXISTS public.complete_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_complete_course_access UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_complete_course_access_student ON public.complete_course_access(student_id);
CREATE INDEX IF NOT EXISTS idx_complete_course_access_status ON public.complete_course_access(status);

-- 4. Create Audit Log for Complete Course Grant / Revoke History
CREATE TABLE IF NOT EXISTS public.complete_course_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked')),
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_complete_course_logs_student ON public.complete_course_access_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_complete_course_logs_created ON public.complete_course_access_logs(created_at DESC);

-- 5. Storage Bucket for Complete Course Private Materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('complete-course-files', 'complete-course-files', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.complete_course_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complete_course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complete_course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complete_course_access_logs ENABLE ROW LEVEL SECURITY;

-- 7. Settings Policies
DROP POLICY IF EXISTS "Public can view complete course settings" ON public.complete_course_settings;
CREATE POLICY "Public can view complete course settings"
  ON public.complete_course_settings FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins full access complete course settings" ON public.complete_course_settings;
CREATE POLICY "Admins full access complete course settings"
  ON public.complete_course_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. Resources Policies (Admins full access, students only if independently granted access)
DROP POLICY IF EXISTS "Admins full access complete course resources" ON public.complete_course_resources;
CREATE POLICY "Admins full access complete course resources"
  ON public.complete_course_resources FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Approved students can view complete course resources" ON public.complete_course_resources;
CREATE POLICY "Approved students can view complete course resources"
  ON public.complete_course_resources FOR SELECT
  USING (
    is_published = true AND (
      EXISTS (
        SELECT 1 FROM public.complete_course_access
        WHERE student_id = auth.uid() AND status = 'active'
      )
    )
  );

-- 9. Complete Course Access Policies
DROP POLICY IF EXISTS "Admins full access complete course access" ON public.complete_course_access;
CREATE POLICY "Admins full access complete course access"
  ON public.complete_course_access FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Students can view own complete course access" ON public.complete_course_access;
CREATE POLICY "Students can view own complete course access"
  ON public.complete_course_access FOR SELECT
  USING (student_id = auth.uid());

-- 10. Audit Logs Policies
DROP POLICY IF EXISTS "Admins full access complete course access logs" ON public.complete_course_access_logs;
CREATE POLICY "Admins full access complete course access logs"
  ON public.complete_course_access_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 11. Backend Service Role Policies (API Routes bypass)
DROP POLICY IF EXISTS "Service role full access complete_course_settings" ON public.complete_course_settings;
CREATE POLICY "Service role full access complete_course_settings" ON public.complete_course_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access complete_course_resources" ON public.complete_course_resources;
CREATE POLICY "Service role full access complete_course_resources" ON public.complete_course_resources FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access complete_course_access" ON public.complete_course_access;
CREATE POLICY "Service role full access complete_course_access" ON public.complete_course_access FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access complete_course_access_logs" ON public.complete_course_access_logs;
CREATE POLICY "Service role full access complete_course_access_logs" ON public.complete_course_access_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 12. Seed Default Settings & Pricing (Complete Spoken English Course: ₹4,999)
INSERT INTO public.complete_course_settings (
  id, title, description, cover_image_url, 
  original_price, selling_price, currency, discount_percent, offer_tag, is_offer_active,
  is_published, updated_at
)
VALUES (
  'default',
  'Complete Spoken English Course',
  'Get access to the complete English learning course, including all learning materials and additional resources provided by Learn and Grow.',
  '/complete-course-cover.png',
  14999,
  4999,
  '₹',
  67,
  'COMPLETE MASTERY PACK',
  true,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  original_price = EXCLUDED.original_price,
  selling_price = EXCLUDED.selling_price,
  currency = EXCLUDED.currency,
  discount_percent = EXCLUDED.discount_percent,
  offer_tag = EXCLUDED.offer_tag,
  is_offer_active = EXCLUDED.is_offer_active;

-- 13. Seed Starter Learning Resources
INSERT INTO public.complete_course_resources (id, title, description, resource_type, file_name, file_storage_path, file_size_bytes, external_url, order_index, is_published)
VALUES
  (
    'res-01',
    'English Grammar Complete Guide',
    'Comprehensive reference handbook containing all foundational grammar structures, tense mastery tables, and everyday spoken exercises.',
    'pdf',
    'English Grammar Complete Guide.pdf',
    'complete-course/English-Grammar-Complete-Guide.pdf',
    184500,
    NULL,
    1,
    true
  ),
  (
    'res-02',
    'Spoken English Learning Materials',
    'Interactive dialogue templates, daily practice drills, and vocabulary worksheets in editable Microsoft Word format.',
    'doc',
    'Spoken English Learning Materials.docx',
    'complete-course/Spoken-English-Learning-Materials.docx',
    96200,
    NULL,
    2,
    true
  ),
  (
    'res-03',
    'Pronunciation Practice — Audio & Video Portal',
    'Interactive pronunciation lab with audio exercises, mouth position guides, and phonetics practice.',
    'link',
    NULL,
    NULL,
    NULL,
    'https://learnandgrow050518.wixsite.com/learn-and-grow',
    3,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  resource_type = EXCLUDED.resource_type,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published;

