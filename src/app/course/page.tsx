import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  MessageCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { getCourseWeeks } from "@/lib/data-store";
import { COURSE_CONFIG, getEnrollmentWhatsAppUrl } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseModuleList } from "./CourseModuleList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "8-Week Course Curriculum & Modules | Modern Web Engineering",
  description:
    "Explore the complete 8-week syllabus, weekly learning objectives, and access verified student study materials.",
};

export default async function CoursePage() {
  const { user, subscriptionStatus } = await getCurrentSession();
  const weeks = await getCourseWeeks();
  const hasAccess = user?.role === "admin" || subscriptionStatus === "active";
  const whatsAppUrl = getEnrollmentWhatsAppUrl(user?.email);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar currentUser={user} subscriptionStatus={subscriptionStatus} />

      <main className="flex-1 pb-20">
        {/* COURSE HERO / HEADER */}
        <div className="bg-[#F5F2EB] border-b border-[#E7E2D6] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EFECE4] text-[#44403C] border border-[#DCD4C4]">
                  Official Curriculum
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFECE4] text-[#C25E38] border border-[#DCD4C4] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Duration: 8 Weeks
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFECE4] text-[#15803D] border border-[#DCD4C4] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  8 Weekly PDF Guides
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1917] tracking-tight">
                {COURSE_CONFIG.courseTitle}
              </h1>

              <p className="text-base sm:text-lg text-[#57534E] leading-relaxed">
                {COURSE_CONFIG.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-sm transition-all hover:shadow"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Contact Instructor on WhatsApp</span>
                </a>

                {!user && (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-[#F5F2EB] text-[#1C1917] border border-[#D4CDBC] shadow-xs transition-colors"
                  >
                    <span>Student Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ACCESS STATUS NOTIFICATION BANNER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {hasAccess ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-3.5 text-[#065F46] shadow-xs">
              <Unlock className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">
                  {user?.role === "admin"
                    ? "Administrator Access Active"
                    : `Active Subscription: Welcome back, ${user?.name}!`}
                </h3>
                <p className="text-xs text-[#047857] mt-0.5 leading-relaxed">
                  You have verified access to all eight weekly modules. You can
                  view or download the official PDF learning compendiums
                  directly on this page.
                </p>
              </div>
            </div>
          ) : user && subscriptionStatus === "pending" ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3.5 text-[#92400E] shadow-xs">
              <Clock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold">
                  Subscription Pending Verification
                </h3>
                <p className="text-xs text-[#B45309] leading-relaxed">
                  Your student account ({user.email}) is registered, but your
                  course enrollment has not been approved yet. Please contact
                  the administrator via WhatsApp to confirm your payment and
                  unlock course materials.
                </p>
                <div className="pt-1">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#92400E] underline hover:text-[#78350F]"
                  >
                    <span>Message Administrator on WhatsApp now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : user && subscriptionStatus === "revoked" ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3.5 text-[#991B1B] shadow-xs">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Course Access Suspended</h3>
                <p className="text-xs text-[#B91C1C] mt-0.5 leading-relaxed">
                  Your subscription status is currently revoked. Please reach
                  out to the course administrator on WhatsApp if you believe
                  this is an error.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2EB] border border-[#D4CDBC] flex items-start gap-3.5 text-[#57534E] shadow-xs">
              <Lock className="w-5 h-5 text-[#78716C] shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    Visitor Preview Mode
                  </h3>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Course materials are protected. Review the syllabus below,
                    then contact the administrator on WhatsApp to enroll and
                    unlock access.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shrink-0 shadow-xs"
                  >
                    Register Account
                  </Link>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shrink-0 shadow-xs"
                  >
                    Enroll via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COURSE INFORMATION & OBJECTIVES */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="bg-white border border-[#E7E2D6] rounded-2xl p-6 sm:p-8 space-y-6 beige-card-shadow">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                Learning Outcomes
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] mt-1">
                Course Syllabus & Learning Objectives
              </h2>
              <p className="text-sm text-[#57534E] mt-1">
                By the conclusion of the 8-week curriculum, every student will
                have mastered:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#1C1917] block">
                    V8 Runtime, Execution Context & ES6 Architecture
                  </span>
                  <span className="text-[#57534E]">
                    Master asynchronous concurrency, garbage collection, and
                    clean modular TypeScript code.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#1C1917] block">
                    Enterprise Reactive Component Architecture
                  </span>
                  <span className="text-[#57534E]">
                    Design reusable atomic components, custom hook primitives,
                    and performant UI pipelines.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#1C1917] block">
                    Relational PostgreSQL Schema Modeling & ACID Safety
                  </span>
                  <span className="text-[#57534E]">
                    Implement normalized relational databases, indexes,
                    connection pooling, and transactional integrity.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-[#1C1917] block">
                    Defense-In-Depth Authentication & Web Hardening
                  </span>
                  <span className="text-[#57534E]">
                    Deploy secure HTTP-only cookies, Row Level Security (RLS),
                    CSRF protection, and rate limiting.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8 WEEKLY LEARNING MODULES */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                Modules 01 to 08
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
                Weekly Course Modules
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#78716C]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                {hasAccess ? "Access Granted" : "Enrollment Required"}
              </span>
              <span>•</span>
              <span>8 Total Modules</span>
            </div>
          </div>

          {/* Interactive Module Cards */}
          <CourseModuleList
            weeks={weeks}
            hasAccess={hasAccess}
            userRole={user?.role || null}
            subscriptionStatus={subscriptionStatus}
          />
        </div>

        {/* WHATSAPP ENROLLMENT ASSISTANCE BANNER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-[#F5F2EB] border border-[#D4CDBC] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 beige-card-shadow">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
                Instructor Advisory
              </span>
              <h3 className="text-2xl font-bold text-[#1C1917]">
                Need help deciding if this course is right for you?
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Connect directly with the course instructor via WhatsApp to
                review prerequisite knowledge, payment options, and personalized
                study goals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
