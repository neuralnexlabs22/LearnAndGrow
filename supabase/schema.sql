-- =========================================================================
-- 8-Week Student Course Platform: Database Schema & Row-Level Security
-- Compatible with Supabase PostgreSQL & Supabase Auth
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

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

-- 3. COURSE WEEKS TABLE (8 Modules)
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_weeks ENABLE ROW LEVEL SECURITY;

-- Profiles: Students can read their own profile; Admins can read all profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Subscriptions: Students can view their own subscription status
CREATE POLICY "Students can view own subscription" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Admins have full access to subscriptions" 
ON public.subscriptions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Course Weeks: Public can read metadata (week number, title, description, published)
CREATE POLICY "Public can view published course weeks metadata" 
ON public.course_weeks FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage course weeks" 
ON public.course_weeks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =========================================================================
-- PRIVATE STORAGE BUCKET CONFIGURATION
-- =========================================================================

-- Create private bucket for course materials if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Admins have full access to upload and delete
CREATE POLICY "Admins full access to course materials"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'course-materials' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'course-materials' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Storage RLS: Only students with ACTIVE subscription or Admins can read files
CREATE POLICY "Active students can read course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-materials' AND (
    EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE student_id = auth.uid() AND status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- =========================================================================
-- INITIAL 8-WEEK SEED DATA
-- =========================================================================
INSERT INTO public.course_weeks (id, week_number, title, description, learning_objectives, is_published)
VALUES
  (
    'week-1', 
    1, 
    'Core Architecture, Execution Context & Modern ES6+ Systems',
    'Understand JavaScript runtime engines, call stacks, event loops, memory lifecycle, and clean code patterns for scalable engineering.',
    '["JavaScript Engine Internals (V8 & SpiderMonkey)", "Execution Context, Call Stack & Microtask Queue", "Memory Allocation, Garbage Collection & Leak Prevention", "Modern ES6+ Modules, Iterators & Immutable Data Patterns"]'::jsonb,
    true
  ),
  (
    'week-2', 
    2, 
    'Component Architecture, Reactive State & High-Performance UI',
    'Design composable component hierarchies, understand virtual DOM diffing, master custom state hooks, and optimize rendering pipelines.',
    '["Atomic Design & Modular Component Hierarchies", "Reactivity Models & Virtual DOM Reconciliation", "Custom Hook Factories & Fine-Grained State Primitives", "Render Tree Profiling, Memoization & Layout Shifts"]'::jsonb,
    true
  ),
  (
    'week-3', 
    3, 
    'Backend Services, REST Protocols & Edge Middleware Architecture',
    'Build production-grade server endpoints, handle streaming requests, design robust API contracts, and leverage edge middleware.',
    '["HTTP/2 & HTTP/3 Transport Mechanics", "RESTful API Design Standards & Idempotency", "Edge Middleware, Routing & Request Pipelines", "Error Handling Standards & Structured Logging"]'::jsonb,
    true
  ),
  (
    'week-4', 
    4, 
    'Relational Databases, PostgreSQL Modeling & ACID Transactions',
    'Master relational schema modeling, foreign key constraints, indexes, connection pooling, and multi-step ACID transactions.',
    '["Normalized Relational Schema Design (3NF)", "Indexes: B-Tree, Hash, GIN & Query Planners", "ACID Guarantees, Isolation Levels & Concurrency", "Connection Pooling & Migration Workflows"]'::jsonb,
    true
  ),
  (
    'week-5', 
    5, 
    'Authentication, Role-Based Access Control & Web Security Hardening',
    'Implement defense-in-depth security: JWTs, secure HTTP-only cookie sessions, CSRF/XSS defenses, rate limiting, and RLS.',
    '["Token Mechanics: Refresh & Access Token Lifecycles", "Secure Cookie Flags (HttpOnly, SameSite, Secure)", "Threat Mitigation: CSRF, XSS, SSRF & Injection", "Row Level Security (RLS) & Granular RBAC Gates"]'::jsonb,
    true
  ),
  (
    'week-6', 
    6, 
    'Real-Time Synchronization, WebSockets & Distributed Caching',
    'Implement duplex communication channels, handle optimistic UI updates, and design multi-tiered Redis caching strategies.',
    '["WebSocket Protocol Handshakes & Heartbeats", "Pub/Sub Architectures & Presence Tracking", "Cache Invalidation Patterns (Stale-While-Revalidate)", "Optimistic UI State & Event Reconciliation"]'::jsonb,
    true
  ),
  (
    'week-7', 
    7, 
    'Automated Testing, CI/CD Pipelines & Containerized Environments',
    'Write unit, integration, and end-to-end tests; configure GitHub Actions CI/CD workflows, Docker containers, and artifact validation.',
    '["Test-Driven Design: Unit, Integration & Contract Testing", "End-to-End Browser Automation with Playwright", "Containerization with Multi-Stage Dockerfiles", "Automated CI/CD Validation & Staging Deployments"]'::jsonb,
    true
  ),
  (
    'week-8', 
    8, 
    'Capstone Architecture, Production Observability & Performance Audits',
    'Bring everything together into a scalable capstone project. Perform Core Web Vitals audits, configure OpenTelemetry, and deploy.',
    '["Full-Stack Production System Architecture", "Core Web Vitals (LCP, INP, CLS) Optimization", "APM Observability, Metrics & Telemetry Tracing", "Final Production Audit, Security Checklist & Launch"]'::jsonb,
    true
  )
ON CONFLICT (week_number) DO NOTHING;
