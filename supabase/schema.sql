-- =========================================================================
-- 8-Week English Learning Course Platform: Complete Supabase Database Schema
-- "Learn and Grow: Speak English with Confidence"
-- =========================================================================

-- Enable required cryptographic & UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. PROFILES TABLE (Students & Administrators)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  password_hash TEXT,
  photo_url TEXT,
  completion_status TEXT NOT NULL DEFAULT 'enrolled' CHECK (completion_status IN ('enrolled', 'in_progress', 'completed', 'revoked')),
  completed_at TIMESTAMPTZ,
  public_consent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON public.profiles(completion_status);

-- =========================================================================
-- 2. SUBSCRIPTIONS TABLE (Course Access & Payment Moderation)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'revoked')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_subscription UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_student_id ON public.subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- =========================================================================
-- 3. COURSE WEEKS TABLE (8 Comprehensive English Modules)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.course_weeks (
  id TEXT PRIMARY KEY,
  week_number INT NOT NULL UNIQUE CHECK (week_number >= 1 AND week_number <= 8),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  pdf_filename TEXT,
  pdf_storage_path TEXT,
  pdf_filesize_bytes BIGINT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_course_weeks_number ON public.course_weeks(week_number);

-- =========================================================================
-- 4. REVIEWS TABLE (Student Testimonials & Moderation)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_photo_url TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_completed_student BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_review UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews(is_featured);

-- =========================================================================
-- 5. STORAGE BUCKETS SETUP (PDF Materials & Profile Photos)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course-pdfs', 'course-pdfs', true, 26214400, ARRAY['application/pdf']),
  ('student-photos', 'student-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read of published course weeks
DROP POLICY IF EXISTS "Public can view published course weeks" ON public.course_weeks;
CREATE POLICY "Public can view published course weeks" 
ON public.course_weeks FOR SELECT 
USING (is_published = true);

-- Allow public read of approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" 
ON public.reviews FOR SELECT 
USING (status = 'approved');

-- Allow public read of graduate profiles with consent
DROP POLICY IF EXISTS "Public can view graduate consent profiles" ON public.profiles;
CREATE POLICY "Public can view graduate consent profiles"
ON public.profiles FOR SELECT
USING (public_consent = true);

-- Allow full access to service_role (used by Next.js server API routes)
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access subscriptions" ON public.subscriptions;
CREATE POLICY "Service role full access subscriptions" ON public.subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access course_weeks" ON public.course_weeks;
CREATE POLICY "Service role full access course_weeks" ON public.course_weeks FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access reviews" ON public.reviews;
CREATE POLICY "Service role full access reviews" ON public.reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow public/anon operations with fallback for simple client requests
DROP POLICY IF EXISTS "Allow anon read all course weeks" ON public.course_weeks;
CREATE POLICY "Allow anon read all course weeks" ON public.course_weeks FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon read approved reviews" ON public.reviews;
CREATE POLICY "Allow anon read approved reviews" ON public.reviews FOR SELECT TO anon USING (status = 'approved');

DROP POLICY IF EXISTS "Allow anon insert reviews" ON public.reviews;
CREATE POLICY "Allow anon insert reviews" ON public.reviews FOR INSERT TO anon WITH CHECK (true);

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public access to course-pdfs" ON storage.objects;
CREATE POLICY "Public access to course-pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'course-pdfs');

DROP POLICY IF EXISTS "Public access to student-photos" ON storage.objects;
CREATE POLICY "Public access to student-photos" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos');

DROP POLICY IF EXISTS "Service role storage manage" ON storage.objects;
CREATE POLICY "Service role storage manage" ON storage.objects FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========================================================================
-- 7. SEED DATA: 8-WEEK ENGLISH LEARNING COURSE MODULES
-- =========================================================================
INSERT INTO public.course_weeks (id, week_number, title, description, learning_objectives, pdf_filename, pdf_storage_path, pdf_filesize_bytes, is_published)
VALUES
  (
    'week-1', 
    1, 
    'English Foundations and Basic Sentence Formation',
    'Master essential sentence structures (SVO), subject-verb agreement, common auxiliary verbs, and foundational conversational patterns.',
    '["Subject-Verb-Object (SVO) Core Architecture", "Articles (A, An, The) & Demonstrative Pronouns", "Auxiliary Verbs (Be, Do, Have) in Present Simple", "Essential Everyday Greetings & Self-Introductions"]'::jsonb,
    'Week-01-English-Foundations.pdf',
    'week-1/Week-01-English-Foundations.pdf',
    24800,
    true
  ),
  (
    'week-2', 
    2, 
    'Grammar and Tenses Mastery',
    'Gain complete control over past, present, and future tenses. Learn how native speakers convey timelines and completed experiences naturally.',
    '["Present Simple vs. Present Continuous in Real Contexts", "Past Simple vs. Present Perfect: Eliminating Common Errors", "Future Projections (Will vs. Going to vs. Present Continuous)", "Time Markers, Prepositions of Time (In, On, At) & Practice Drills"]'::jsonb,
    'Week-02-Grammar-and-Tenses.pdf',
    'week-2/Week-02-Grammar-and-Tenses.pdf',
    26100,
    true
  ),
  (
    'week-3', 
    3, 
    'Vocabulary and Everyday Expressions',
    'Expand beyond basic vocabulary with 250+ high-frequency collocations, phrasal verbs, idioms, and natural transitions used in daily interactions.',
    '["High-Frequency Phrasal Verbs for Everyday Life", "Collocations & Natural Word Pairings", "Expressing Opinions, Agreement, and Polite Disagreement", "Idiomatic Expressions for Modern Social Conversation"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-4', 
    4, 
    'Spoken English and Conversation Practice',
    'Develop spoken fluency, overcome hesitation, and practice real-time conversational turn-taking, active listening cues, and storytelling techniques.',
    '["Overcoming Hesitation & Fear of Making Mistakes", "Conversational Connectors & Fillers Used Naturally", "Asking Engaging Open-Ended Questions in Dialogue", "Mini-Storytelling: Structuring Short Personal Anecdotes"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-5', 
    5, 
    'Pronunciation, Accent Clarity and Listening Skills',
    'Sharpen your acoustic comprehension and speech clarity. Master vowel distinctions, syllable stress, connected speech, and native intonation rhythms.',
    '["Vowel & Consonant Minimal Pairs Training", "Word Stress, Syllable Timing & Sentence Intonation", "Connected Speech (Linking, Elision & Weak Forms)", "Listening Strategies for Fast-Paced Native Audio"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-6', 
    6, 
    'Reading Comprehension and Writing Precision',
    'Analyze diverse texts, build analytical comprehension, and draft clear, cohesive emails, professional letters, and personal essays.',
    '["Skimming & Scanning Techniques for Articles & Books", "Professional Email Etiquette & Structural Formats", "Paragraph Cohesion, Transitions & Punctuation Precision", "Writing Descriptive & Persuasive Short Texts"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-7', 
    7, 
    'Communication Skills and Real-Life Situations',
    'Apply your English in workplace environments, job interviews, customer service, telephone calls, travel scenarios, and negotiations.',
    '["Interview Preparation & Self-Introduction Mastery", "Workplace Meetings, Summaries & Action Items", "Telephone & Video Call Communication Etiquette", "Travel, Dining, Emergencies & Social Etiquette"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-8', 
    8, 
    'Revision, Practical Exercises, and Final Assessment',
    'Consolidate your 8-week knowledge with practical roleplays, comprehensive grammar & vocabulary review, and your final spoken English evaluation.',
    '["Comprehensive Grammar & Phrasal Verb Synthesis", "Live Roleplay Simulation & Spoken Review", "Self-Assessment Portfolio & Ongoing Study Plan", "Final Spoken Evaluation & Course Completion Award"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  )
ON CONFLICT (week_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  learning_objectives = EXCLUDED.learning_objectives,
  is_published = EXCLUDED.is_published;

-- =========================================================================
-- 8. SEED DATA: ADMINISTRATOR ONLY
-- =========================================================================

-- Admin User (admin@course.edu / AdminPass123!)
INSERT INTO public.profiles (id, name, email, role, password_hash, completion_status, public_consent)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Course Administrator',
  'admin@course.edu',
  'admin',
  'AdminPass123!',
  'completed',
  false
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  password_hash = 'AdminPass123!';

