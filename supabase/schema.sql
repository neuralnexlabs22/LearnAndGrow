-- =========================================================================
-- 8-Week English Learning Course Platform: Database Schema & Row-Level Security
-- "Speak English with Confidence"
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  photo_url TEXT,
  completion_status TEXT NOT NULL DEFAULT 'enrolled' CHECK (completion_status IN ('enrolled', 'in_progress', 'completed', 'revoked')),
  completed_at TIMESTAMPTZ,
  public_consent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON public.profiles(completion_status);

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3. COURSE WEEKS TABLE (8 English Modules)
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

-- 4. STUDENT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Public can view graduate consent profiles for reviews"
ON public.profiles FOR SELECT
USING (public_consent = true);

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subscriptions Policies
CREATE POLICY "Students can view own subscription" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Admins have full access to subscriptions" 
ON public.subscriptions FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Course Weeks Policies
CREATE POLICY "Public can view published course weeks" 
ON public.course_weeks FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins have full access to course weeks" 
ON public.course_weeks FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews Policies
CREATE POLICY "Public can view approved reviews" 
ON public.reviews FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Students can view own review" 
ON public.reviews FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can create own review" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = student_id AND status = 'pending');

CREATE POLICY "Students can update own review" 
ON public.reviews FOR UPDATE 
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id AND status = 'pending');

CREATE POLICY "Students can delete own review" 
ON public.reviews FOR DELETE 
USING (auth.uid() = student_id);

CREATE POLICY "Admins have full access to reviews" 
ON public.reviews FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================================================================
-- SEED 8-WEEK ENGLISH LEARNING COURSE MODULES
-- =========================================================================
INSERT INTO public.course_weeks (id, week_number, title, description, learning_objectives, is_published)
VALUES
  (
    'week-1', 
    1, 
    'English Foundations and Basic Sentence Formation',
    'Master essential sentence structures (SVO), subject-verb agreement, common auxiliary verbs, and foundational conversational patterns.',
    '["Subject-Verb-Object (SVO) Core Architecture", "Articles (A, An, The) & Demonstrative Pronouns", "Auxiliary Verbs (Be, Do, Have) in Present Simple", "Essential Everyday Greetings & Self-Introductions"]'::jsonb,
    true
  ),
  (
    'week-2', 
    2, 
    'Grammar and Tenses Mastery',
    'Gain complete control over past, present, and future tenses. Learn how native speakers convey timelines and completed experiences naturally.',
    '["Present Simple vs. Present Continuous in Real Contexts", "Past Simple vs. Present Perfect: Eliminating Common Errors", "Future Projections (Will vs. Going to vs. Present Continuous)", "Time Markers, Prepositions of Time (In, On, At) & Practice Drills"]'::jsonb,
    true
  ),
  (
    'week-3', 
    3, 
    'Vocabulary and Everyday Expressions',
    'Expand beyond basic vocabulary with 250+ high-frequency collocations, phrasal verbs, idioms, and natural transitions used in daily interactions.',
    '["High-Frequency Phrasal Verbs for Everyday Life", "Collocations & Natural Word Pairings", "Expressing Opinions, Agreement, and Polite Disagreement", "Idiomatic Expressions for Modern Social Conversation"]'::jsonb,
    true
  ),
  (
    'week-4', 
    4, 
    'Spoken English and Conversation Practice',
    'Develop spoken fluency, overcome hesitation, and practice real-time conversational turn-taking, active listening cues, and storytelling techniques.',
    '["Overcoming Hesitation & Fear of Making Mistakes", "Conversational Connectors & Fillers Used Naturally", "Asking Engaging Open-Ended Questions in Dialogue", "Mini-Storytelling: Structuring Short Personal Anecdotes"]'::jsonb,
    true
  ),
  (
    'week-5', 
    5, 
    'Pronunciation, Accent Clarity and Listening Skills',
    'Sharpen your acoustic comprehension and speech clarity. Master vowel distinctions, syllable stress, connected speech, and native intonation rhythms.',
    '["Vowel & Consonant Minimal Pairs Training", "Word Stress, Syllable Timing & Sentence Intonation", "Connected Speech (Linking, Elision & Weak Forms)", "Listening Strategies for Fast-Paced Native Audio"]'::jsonb,
    true
  ),
  (
    'week-6', 
    6, 
    'Reading Comprehension and Writing Precision',
    'Analyze diverse texts, build analytical comprehension, and draft clear, cohesive emails, professional letters, and personal essays.',
    '["Skimming & Scanning Techniques for Articles & Books", "Professional Email Etiquette & Structural Formats", "Paragraph Cohesion, Transitions & Punctuation Precision", "Writing Descriptive & Persuasive Short Texts"]'::jsonb,
    true
  ),
  (
    'week-7', 
    7, 
    'Communication Skills and Real-Life Situations',
    'Apply your English in workplace environments, job interviews, customer service, telephone calls, travel scenarios, and negotiations.',
    '["Interview Preparation & Self-Introduction Mastery", "Workplace Meetings, Summaries & Action Items", "Telephone & Video Call Communication Etiquette", "Travel, Dining, Emergencies & Social Etiquette"]'::jsonb,
    true
  ),
  (
    'week-8', 
    8, 
    'Revision, Practical Exercises, and Final Assessment',
    'Consolidate your 8-week knowledge with practical roleplays, comprehensive grammar & vocabulary review, and your final spoken English evaluation.',
    '["Comprehensive Grammar & Phrasal Verb Synthesis", "Live Roleplay Simulation & Spoken Review", "Self-Assessment Portfolio & Ongoing Study Plan", "Final Spoken Evaluation & Course Completion Award"]'::jsonb,
    true
  )
ON CONFLICT (week_number) DO NOTHING;
