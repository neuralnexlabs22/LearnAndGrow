# 8-Week Student Course Platform (Modern Web Engineering)

A modern, responsive, and secure online learning platform designed exclusively for an intensive 8-week student course. Built with a refined **warm beige editorial aesthetic**, private PDF storage, WhatsApp click-to-chat enrollment workflow, and an administrator dashboard for course material and student subscription management.

---

## 🌟 Key Features

1. **Beige-Based Editorial UI**
   - Curated warm ivory, linen cream, sand, and espresso charcoal color palette (`#FBF9F5`, `#F5F2EB`, `#E7E2D6`, `#1C1917`).
   - Clean visual hierarchy, crisp card shadows, and subtle micro-transitions.
   - Built with Next.js App Router, TypeScript, and Tailwind CSS.

2. **Dedicated Two Main Public Pages**
   - **Home Page (`/`)**:
     - Hero section with 8-week badge, course summary, and primary/secondary CTAs.
     - Course introduction (who the course is for, learning objectives).
     - 8-Week curriculum progression grid.
     - What students receive (PDF compendiums, WhatsApp advisory, private storage).
     - 5-Step WhatsApp enrollment workflow breakdown.
     - Frequently Asked Questions accordion.
     - Responsive navigation and footer with WhatsApp contact details.
   - **Course Page (`/course`)**:
     - Complete 8-week syllabus and learning milestones.
     - Real-time student access status banner (Visitor Preview, Pending Approval, Active Access, or Revoked).
     - Exactly 8 weekly modules with locked/unlocked state enforcement.
     - In-app PDF Viewer Modal (`PdfViewerModal`) for seamless reading.
     - WhatsApp instructor advisory banner.

3. **WhatsApp Click-to-Chat Integration**
   - Configurable admin WhatsApp number via `NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER`.
   - Strict `https://wa.me/COUNTRYCODEPHONENUMBER?text=ENCODED_MESSAGE` formatting.
   - Pre-filled messages tailored to course inquiries, fees, and specific weekly modules.
   - Clear on-site explanation: enrollment and tuition are verified manually outside the platform before course materials are unlocked.

4. **Robust Authentication & Subscription Control**
   - Student registration, sign-in, and sign-out.
   - Distinct subscription statuses: `pending`, `active`, `rejected`, `revoked`.
   - Newly registered students automatically start with `pending` status.
   - Separation of authentication and subscription authorization: only `active` students and administrators can access materials.

5. **Private PDF Storage & Secure Delivery**
   - Course files are stored in a private directory (`private_uploads/course-materials/` or private Supabase Storage bucket).
   - Never placed in public asset folders.
   - Protected API routes:
     - `/api/materials/[weekNumber]/download`
     - `/api/materials/[weekNumber]/view`
   - Strict server-side verification: unauthorized requests return HTTP `401 Unauthorized` or `403 Forbidden`.
   - Headers enforce non-caching (`Cache-Control: private, no-store, max-age=0`).

6. **Admin Dashboard (`/admin`)**
   - Server-side role protection: only accounts with `role: 'admin'` can access. Non-admins are redirected or blocked.
   - **Overview Metrics**: Total registered students, Active subscriptions, Pending verification count, Total uploaded PDFs.
   - **Course Content Management**:
     - Upload, replace, or delete PDF for each of the 8 weeks.
     - PDF-only validation and 25MB file size limit.
     - Edit week title, description, and learning objectives.
     - Publish/unpublish weekly materials toggle.
     - Instant in-app PDF preview.
     - Confirmation modal before deleting materials.
   - **Student Management**:
     - Search students by name or email.
     - Filter tabs: All, Pending, Active, Revoked, Rejected.
     - Actions: Approve subscription, Reject pending, Revoke active access (with confirmation), and Re-activate.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom warm beige theme tokens
- **Icons**: Lucide React
- **Database & Storage**:
  - Resilient Local Persistent Storage (`data/course_store.json` & `private_uploads/`) for zero-friction local development and testing.
  - Production-ready PostgreSQL & Private Storage with Supabase (`supabase/schema.sql` included with full RLS policies).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Installation
```bash
git clone <repo-url>
cd course
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your administrator WhatsApp number (digits only, country code + number):
```env
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER=15550192834
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Configured Test Accounts

The platform includes pre-seeded demo accounts with one-click switcher buttons on the `/login` page:

| Role | Email | Password | Status / Access |
|---|---|---|---|
| **Course Administrator** | `admin@course.edu` | `AdminPass123!` | Full Admin Dashboard & All PDFs |
| **Active Student (Alex)** | `active.student@example.com` | `StudentPass123!` | Active (Unlocked 8-week PDFs) |
| **Pending Student (Samantha)** | `pending.student@example.com` | `StudentPass123!` | Pending (Locked, WhatsApp prompt) |
| **Revoked Student (Marcus)** | `revoked.student@example.com` | `StudentPass123!` | Revoked (Access suspended) |

Visitors can also register any new student account on `/register`. New accounts immediately begin with `pending` status until approved by the admin.

---

## 🗄️ Supabase Database & Private Storage Setup

If connecting to an external Supabase project:
1. Open your Supabase SQL Editor.
2. Execute the provided SQL migration in `supabase/schema.sql`.
3. This creates:
   - `profiles` table with RLS
   - `subscriptions` table with RLS
   - `course_weeks` table (seeded with all 8 weeks)
   - Private `course-materials` storage bucket with restricted read/write policies.
4. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

---

## 🔒 Security Architecture

1. **Authentication Separation**: Authenticated students are NOT assumed to have paid. Their subscription is checked separately via `requireActiveAccess()`.
2. **Private Storage**: PDFs are streamed directly from private storage through authenticated route handlers. No static public URLs exist.
3. **Admin Verification**: All admin actions (PDF upload, delete, subscription approve/revoke) require server-side verification using `requireAdmin()`.
4. **Input Sanitization**: Uploaded files must match `.pdf` extension and MIME type, strictly under 25MB. Filenames are sanitized against path traversal.
