<<<<<<< HEAD
# 8-Week English Learning Course Platform: "Speak English with Confidence"

A modern, responsive, and secure online learning platform designed exclusively for an intensive 8-week English learning course. Built with a refined **warm beige editorial aesthetic**, private PDF study workbooks, verified course completion tracking, a 5-star student review & success stories system, WhatsApp click-to-chat enrollment workflow, and an administrator dashboard for complete course management.

---

## 🌟 Key Features & Capabilities

### 1. English Learning Course Curriculum & Landing Experience
- **Home Page (`/`)**:
  - Hero headline: *"Speak English with Confidence"*.
  - Compelling subtitle: *"Build your English skills step by step through an 8-week learning journey covering grammar, vocabulary, speaking, listening, and everyday communication."*
  - **Live Course Completion Counter**: Displays real verified database count of unique graduates (*"X Students Who Completed the Course"*).
  - **Six Core English Mastery Areas**: English Grammar, Vocabulary Building, Spoken English, Pronunciation & Accent Clarity, Listening Comprehension, Writing Precision.
  - **8-Week Progression Cards**: Week 1 through Week 8 visual syllabus roadmap.
  - **Student Success Stories & Verified Reviews**: Real feedback with student photos/avatars, 5-star ratings, and "Course Graduate" badges.
  - **5-Step WhatsApp Enrollment Guide**: Clear steps explaining direct WhatsApp inquiry, fee payment outside platform, manual verification, and account unlock.
- **Course Page (`/course`)**:
  - Full 8-Week English syllabus with editable lesson plans:
    1. *Week 1: English Foundations and Basic Sentence Formation*
    2. *Week 2: Grammar and Tenses Mastery*
    3. *Week 3: Vocabulary and Everyday Expressions*
    4. *Week 4: Spoken English and Conversation Practice*
    5. *Week 5: Pronunciation, Accent Clarity and Listening Skills*
    6. *Week 6: Reading Comprehension and Writing Precision*
    7. *Week 7: Communication Skills and Real-Life Situations*
    8. *Week 8: Revision, Practical Exercises, and Final Assessment*
  - Real-time student access status banner (*Visitor Preview*, *Pending Approval*, *Active Enrolled*, or *Revoked*).
  - In-app PDF Viewer Modal (`PdfViewerModal`) for private workbook previewing.

### 2. Student Photo UI & Profile System
- Display student profile photos or clean default SVG avatars in reviews, success stories, navbar, and admin tables.
- Students and administrators can upload, replace, or remove profile photos (JPG, PNG, WEBP, max 5MB).
- Strict student consent controls (`publicConsent`) to safeguard student privacy.

### 3. Student Review & Five-Star Rating System
- 5-star rating system with written feedback for authenticated students.
- New submissions default to `pending` status until approved by the administrator.
- Students can edit or withdraw their own review at any time.
- Visitors can view all approved reviews without logging in.
- **Admin Reviews Management**:
  - Filter reviews by *All*, *Pending*, *Approved*, and *Rejected*.
  - Approve or reject reviews with a single click.
  - Feature selected approved reviews on the Home page.
  - Permanently remove inappropriate reviews with confirmation dialogs.
  - Real-time average approved rating and total review counts calculated from the database.

### 4. Verified Course Completion Counter
- Prominent live counter on the Home page reflecting unique students whose course completion has been verified by the instructor.
- Completion statuses supported: `enrolled`, `in_progress`, `completed`, `revoked`.
- Only authorized administrators can mark a student as `completed` after evaluating their progress and assignments.
- Records exact completion timestamp (`completedAt`).
- Zero hardcoded or fabricated statistics.

### 5. WhatsApp Click-to-Chat Integration
- Formats links strictly as `https://wa.me/COUNTRYCODEPHONENUMBER?text=ENCODED_MESSAGE`.
- Configurable administrator number via `NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER`.
- Pre-filled message:
  `"Hello, I am interested in joining your 8-week English learning course. Please share the syllabus, course fee, payment instructions, and enrollment procedure."`
- Clear explanation that clicking WhatsApp does not unlock the course automatically; manual verification is required.

### 6. Protected Admin Dashboard (`/admin`)
- Accessible only by verified administrators (`role: 'admin'`).
- **Live Statistics Overview**:
  - Total registered students
  - Active subscriptions
  - Students currently in progress
  - Course graduates (completed students)
  - Pending reviews (with pulsing alert indicator)
  - Approved reviews count
  - Average approved rating
  - Uploaded weekly learning workbooks
- **Tab 1: Course Modules & PDF Materials (8 Weeks)**:
  - Upload/replace/delete PDF workbooks (PDF only, 25MB max).
  - Edit week titles, descriptions, and learning objectives.
  - Toggle published/draft visibility.
  - Preview workbooks in-app.
- **Tab 2: Students & Completion Tracking**:
  - Search students by name or email.
  - Manage student profile photos.
  - Approve or reject subscription upon payment confirmation.
  - Update completion status (`enrolled`, `in_progress`, `completed`, `revoked`).
- **Tab 3: Reviews Management**:
  - Moderate student reviews, approve public display, feature on Home page, or delete.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with bespoke warm beige theme tokens
- **Icons**: Lucide React
- **Storage & Database**:
  - Resilient Local Persistent Storage (`data/course_store.json` & `private_uploads/`) for zero-friction local development and testing.
  - Production-ready PostgreSQL & Storage with Supabase (`supabase/schema.sql` included with full RLS policies).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Environment Variables
Create or verify `.env.local`:
```env
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER=15550192834
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Configured Test Accounts

| Account | Email | Password | Role & Status |
|---|---|---|---|
| **Course Administrator** | `admin@course.edu` | `AdminPass123!` | Administrator (Admin Dashboard & Review Moderation) |
| **Active Graduate Student (Alex)** | `active.student@example.com` | `StudentPass123!` | Active Enrolled, Verified Graduate |
| **Active Student (Samantha)** | `pending.student@example.com` | `StudentPass123!` | Active Enrolled, In Progress |
| **Revoked Student (Marcus)** | `revoked.student@example.com` | `StudentPass123!` | Revoked Access (403 Forbidden on protected files) |

*You can also register any new account on `/register` to test the complete student lifecycle!*
=======
# LearnAndGrow
Build your English skills step by step through an 8-week learning journey covering grammar, vocabulary, speaking, listening, and everyday communication.
>>>>>>> 18ca8d251348167bd998fbdcec5da5ba2af2c5f2
