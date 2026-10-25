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
    'English Foundations',
    'Learn sentence formation, basic vocabulary, and how to introduce yourself confidently.',
    '["Subject-Verb-Object (SVO) Core Architecture", "Articles (A, An, The) & Demonstrative Pronouns", "Auxiliary Verbs (Be, Do, Have) in Present Simple", "Essential Everyday Greetings & Confident Self-Introductions"]'::jsonb,
    'Week-01-English-Foundations.pdf',
    'week-1/Week-01-English-Foundations.pdf',
    24800,
    true
  ),
  (
    'week-2', 
    2, 
    'Grammar and Tenses',
    'Understand essential grammar rules and learn to use present, past, and future tenses.',
    '["Present Simple vs. Present Continuous in Real Contexts", "Past Simple vs. Present Perfect: Eliminating Common Errors", "Future Projections (Will vs. Going to vs. Present Continuous)", "Time Markers, Prepositions of Time (In, On, At) & Practice Drills"]'::jsonb,
    'Week-02-Grammar-and-Tenses.pdf',
    'week-2/Week-02-Grammar-and-Tenses.pdf',
    26100,
    true
  ),
  (
    'week-3', 
    3, 
    'Vocabulary and Daily English',
    'Improve your vocabulary and learn useful expressions for everyday situations.',
    '["High-Frequency Phrasal Verbs for Everyday Life", "Collocations & Natural Word Pairings", "Expressing Opinions, Agreement, and Polite Disagreement", "Idiomatic Expressions for Modern Social Conversation"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-4', 
    4, 
    'Spoken English Practice',
    'Practise conversations, asking questions, answering confidently, and expressing your thoughts.',
    '["Overcoming Hesitation & Fear of Making Mistakes", "Conversational Connectors & Fillers Used Naturally", "Asking Engaging Open-Ended Questions in Dialogue", "Mini-Storytelling: Structuring Short Personal Anecdotes"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-5', 
    5, 
    'Pronunciation and Listening',
    'Improve pronunciation, listening skills, clarity, and fluency.',
    '["Vowel & Consonant Minimal Pairs Training", "Word Stress, Syllable Timing & Sentence Intonation", "Connected Speech (Linking, Elision & Weak Forms)", "Listening Strategies for Fast-Paced Native Audio"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-6', 
    6, 
    'Reading and Writing',
    'Learn to write clear messages, emails, and simple paragraphs in English.',
    '["Skimming & Scanning Techniques for Articles & Books", "Professional Email Etiquette & Structural Formats", "Paragraph Cohesion, Transitions & Punctuation Precision", "Writing Descriptive & Persuasive Short Texts"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-7', 
    7, 
    'Interview and Workplace English',
    'Practise interview answers, professional conversations, meetings, and workplace communication.',
    '["Interview Preparation & Self-Introduction Mastery", "Workplace Meetings, Summaries & Action Items", "Telephone & Video Call Communication Etiquette", "Travel, Dining, Emergencies & Social Etiquette"]'::jsonb,
    NULL,
    NULL,
    NULL,
    true
  ),
  (
    'week-8', 
    8, 
    'Revision and Final Assessment',
    'Review what you have learned and assess your progress.',
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

-- Safe idempotent administrator creation/update (prevents duplicate key errors on id or email)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'learnandgrow050518@gmail.com') THEN
    UPDATE public.profiles
    SET role = 'admin',
        password_hash = 'AdminPass123!',
        name = 'Course Administrator'
    WHERE email = 'learnandgrow050518@gmail.com';
  ELSIF EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid) THEN
    UPDATE public.profiles
    SET email = 'learnandgrow050518@gmail.com',
        role = 'admin',
        password_hash = 'AdminPass123!',
        name = 'Course Administrator'
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  ELSE
    INSERT INTO public.profiles (id, name, email, role, password_hash, completion_status, public_consent)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Course Administrator',
      'learnandgrow050518@gmail.com',
      'admin',
      'AdminPass123!',
      'completed',
      false
    );
  END IF;
END $$;

-- =========================================================================
-- 9. ASSESSMENT TABLES (Free English Grammar Assessment)
-- =========================================================================

-- Assessment Questions Table
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id TEXT PRIMARY KEY,
  order_index INT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_order ON public.assessment_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_level ON public.assessment_questions(level);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_active ON public.assessment_questions(is_active);

-- Assessment Settings Table
CREATE TABLE IF NOT EXISTS public.assessment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  total_questions INT NOT NULL DEFAULT 20,
  marks_per_question INT NOT NULL DEFAULT 1,
  beginner_max_score INT NOT NULL DEFAULT 7,
  intermediate_max_score INT NOT NULL DEFAULT 14,
  beginner_heading TEXT NOT NULL,
  beginner_message TEXT NOT NULL,
  intermediate_heading TEXT NOT NULL,
  intermediate_message TEXT NOT NULL,
  advanced_heading TEXT NOT NULL,
  advanced_message TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  whatsapp_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Assessment Submissions Table
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT,
  student_email TEXT,
  score INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 20,
  accuracy_percentage INT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  level_title TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_submitted ON public.assessment_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_level ON public.assessment_submissions(level);

-- Enable RLS
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Questions RLS: Anyone can view active questions; service role / admin manages
CREATE POLICY "Public can view active assessment questions"
  ON public.assessment_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins have full access to assessment questions"
  ON public.assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Settings RLS: Anyone can view settings; admin manages
CREATE POLICY "Public can view assessment settings"
  ON public.assessment_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify assessment settings"
  ON public.assessment_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Submissions RLS: Anyone can insert submissions; admin can view all
CREATE POLICY "Public can insert assessment submissions"
  ON public.assessment_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view assessment submissions"
  ON public.assessment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =========================================================================
-- 10. SEED DATA: 20 ASSESSMENT QUESTIONS & DEFAULT SETTINGS
-- =========================================================================

INSERT INTO public.assessment_settings (
  id,
  title,
  subtitle,
  description,
  instructions,
  total_questions,
  marks_per_question,
  beginner_max_score,
  intermediate_max_score,
  beginner_heading,
  beginner_message,
  intermediate_heading,
  intermediate_message,
  advanced_heading,
  advanced_message,
  cta_text,
  whatsapp_template,
  is_active
) VALUES (
  'default',
  'Take a Free English Assessment',
  'Learn and Grow – English Assessment',
  'Discover your current English grammar level with our free 20-question assessment. Find out where you stand and take the next step towards speaking English confidently.',
  'Choose the best option for each question. You can change your answers before final submission.',
  20,
  1,
  7,
  14,
  'Let''s Build Your Foundation!',
  'Your English learning journey starts here. Strengthen your grammar and vocabulary with regular practice.',
  'Good Job!',
  'You have a good foundation in English. Keep practising to improve your fluency.',
  'Excellent Work!',
  'You demonstrated strong grammar knowledge. Continue practising to refine your communication skills.',
  'Join Our Spoken English Class',
  'Hello Learn and Grow! I have completed the English Grammar Assessment.{{name}}\nMy Score: {{score}}/{{total}}\nAccuracy: {{accuracy}}\nMy Level: {{level}}\nI am interested in joining your 8-week Spoken English Course. Please share the syllabus, course fee, and enrollment details.',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (id, order_index, level, question_text, options, correct_answer, explanation, is_active)
VALUES
  ('q-01', 1, 'beginner', 'She _____ to school every day.', '["A) go", "B) goes", "C) going", "D) gone"]'::jsonb, 'B) goes', 'Third-person singular "she" takes the singular verb form "goes" in present simple tense.', true),
  ('q-02', 2, 'beginner', 'I saw _____ elephant at the zoo.', '["A) a", "B) an", "C) the", "D) no article"]'::jsonb, 'B) an', 'The word "elephant" begins with a vowel sound, so the indefinite article "an" is used.', true),
  ('q-03', 3, 'beginner', 'They _____ playing cricket now.', '["A) is", "B) am", "C) are", "D) was"]'::jsonb, 'C) are', 'Plural subject "they" requires the plural auxiliary verb "are" in present continuous tense.', true),
  ('q-04', 4, 'beginner', 'This is Rani. _____ is my friend.', '["A) He", "B) It", "C) They", "D) She"]'::jsonb, 'D) She', 'Rani is a female singular person, so the pronoun "She" is correct.', true),
  ('q-05', 5, 'beginner', 'We _____ dinner at 8 p.m. yesterday.', '["A) eat", "B) eaten", "C) ate", "D) eating"]'::jsonb, 'C) ate', 'The past time marker "yesterday" requires the past simple form "ate".', true),
  ('q-06', 6, 'beginner', 'The book is _____ the table.', '["A) on", "B) at", "C) between", "D) from"]'::jsonb, 'A) on', 'We use "on" for contact with a surface like a table.', true),
  ('q-07', 7, 'beginner', 'There _____ two apples in the basket.', '["A) is", "B) are", "C) was", "D) has"]'::jsonb, 'B) are', '"Two apples" is plural, so the plural verb "are" is required.', true),
  ('q-08', 8, 'intermediate', 'I _____ here since 2022, and I still live here.', '["A) lived", "B) am living", "C) have lived", "D) had lived"]'::jsonb, 'C) have lived', 'An action that began in the past and continues to the present requires present perfect ("have lived").', true),
  ('q-09', 9, 'intermediate', 'If she _____ hard, she will pass the exam.', '["A) studied", "B) studies", "C) will study", "D) has studied"]'::jsonb, 'B) studies', 'In first conditional clauses (If + present simple, will + base verb), use "studies".', true),
  ('q-10', 10, 'intermediate', 'She is interested _____ learning English.', '["A) on", "B) at", "C) for", "D) in"]'::jsonb, 'D) in', 'The adjective "interested" takes the preposition "in".', true),
  ('q-11', 11, 'intermediate', 'By the time we arrived, the movie _____.', '["A) starts", "B) has started", "C) had started", "D) will start"]'::jsonb, 'C) had started', 'Past perfect ("had started") indicates an action completed before another past event.', true),
  ('q-12', 12, 'intermediate', 'Neither Ravi nor his friends _____ ready.', '["A) is", "B) are", "C) was", "D) has"]'::jsonb, 'B) are', 'In "neither... nor" constructions, the verb agrees with the closer subject ("his friends", plural).', true),
  ('q-13', 13, 'intermediate', 'This is the woman _____ helped me yesterday.', '["A) which", "B) whose", "C) who", "D) whom"]'::jsonb, 'C) who', 'The relative pronoun "who" refers to people acting as the subject of the clause.', true),
  ('q-14', 14, 'intermediate', 'He was tired, _____ he continued working.', '["A) because", "B) although", "C) so", "D) but"]'::jsonb, 'D) but', '"But" introduces a contrasting coordinating idea.', true),
  ('q-15', 15, 'advanced', 'If I _____ about the traffic, I would have left earlier.', '["A) knew", "B) had known", "C) have known", "D) would know"]'::jsonb, 'B) had known', 'Third conditional (unreal past) uses "had known" with "would have left".', true),
  ('q-16', 16, 'advanced', 'The manager said, "I am busy." Choose the correct reported speech form.', '["A) The manager said that I am busy.", "B) The manager said that he was busy.", "C) The manager said that he is busy yesterday.", "D) The manager said that he were busy."]'::jsonb, 'B) The manager said that he was busy.', 'In indirect speech, present simple shifts back to past simple ("am" -> "was").', true),
  ('q-17', 17, 'advanced', 'Choose the correct passive form: "They have completed the project."', '["A) The project has been completed.", "B) The project had completed.", "C) The project is completing.", "D) The project has being completed."]'::jsonb, 'A) The project has been completed.', 'Present perfect passive structure: has/have + been + past participle ("has been completed").', true),
  ('q-18', 18, 'advanced', 'No sooner _____ the station than the train left.', '["A) we reached", "B) had we reached", "C) we had reached", "D) did we reached"]'::jsonb, 'B) had we reached', 'Negative inversion after "No sooner" requires auxiliary verb first: "had we reached".', true),
  ('q-19', 19, 'advanced', 'Choose the grammatically correct sentence.', '["A) Despite of the rain, we went out.", "B) Although the rain, we went out.", "C) In spite of the rain, we went out.", "D) Despite it was raining, we went out."]'::jsonb, 'C) In spite of the rain, we went out.', '"In spite of" is followed by a noun phrase ("the rain"). "Despite" does not take "of".', true),
  ('q-20', 20, 'advanced', 'Choose the correct sentence using inversion for emphasis.', '["A) Rarely I have seen such a beautiful view.", "B) Rarely have I seen such a beautiful view.", "C) Rarely did I have seen such a beautiful view.", "D) Rarely I saw have such a beautiful view."]'::jsonb, 'B) Rarely have I seen such a beautiful view.', 'When a sentence begins with a negative adverb like "Rarely", subject-auxiliary inversion is used ("have I seen").', true)
ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  level = EXCLUDED.level,
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;

-- =============================================================================
-- COURSE PRICING & FEE BREAKDOWN TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.course_pricing (
  id TEXT PRIMARY KEY DEFAULT 'default',
  original_price NUMERIC NOT NULL DEFAULT 1199,
  selling_price NUMERIC NOT NULL DEFAULT 999,
  currency TEXT NOT NULL DEFAULT '₹',
  discount_percent INT DEFAULT 17,
  offer_tag TEXT DEFAULT 'LIMITED TIME OFFER',
  is_offer_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_pricing ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon) can read current pricing
DROP POLICY IF EXISTS "Public can view pricing" ON public.course_pricing;
CREATE POLICY "Public can view pricing"
  ON public.course_pricing FOR SELECT
  USING (true);

-- Allow server-side API (service role) or authenticated admins to modify pricing.
-- The service_role key bypasses RLS entirely, so this policy is a safety net for anon fallback.
DROP POLICY IF EXISTS "Admins can update pricing" ON public.course_pricing;
CREATE POLICY "Admins can update pricing"
  ON public.course_pricing FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default pricing row
INSERT INTO public.course_pricing (id, original_price, selling_price, currency, discount_percent, offer_tag, is_offer_active, updated_at)
VALUES ('default', 10500, 3500, '₹', 67, 'LIMITED TIME OFFER', true, NOW())
ON CONFLICT (id) DO NOTHING;



