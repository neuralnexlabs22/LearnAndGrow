import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Users,
  HelpCircle,
  ChevronRight,
  MessageSquare,
  Volume2,
  PenTool,
  Headphones,
  Award,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import {
  getCourseWeeks,
  getApprovedReviews,
  getStudentReview,
  getDashboardStats,
} from "@/lib/data-store";
import { COURSE_CONFIG, getEnrollmentWhatsAppUrl } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCompletionCounter } from "@/components/CourseCompletionCounter";
import { ReviewsSection } from "@/components/ReviewsSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, subscriptionStatus } = await getCurrentSession();
  const weeks = await getCourseWeeks();
  const approvedReviews = await getApprovedReviews();
  const stats = await getDashboardStats();

  let userReview = null;
  if (user && user.role === "student") {
    userReview = await getStudentReview(user.id);
  }

  const whatsAppUrl = getEnrollmentWhatsAppUrl(user?.email);

  const highlightIcons = [
    BookOpen,
    Sparkles,
    MessageSquare,
    Volume2,
    Headphones,
    PenTool,
  ];

  const faqs = [
    {
      q: "How long does the English course take to complete?",
      a: "The course is strictly structured across 8 weeks. Each week focuses on a key communication milestone — from grammar foundations to live conversational roleplays — designed for 6 to 8 hours of study per week.",
    },
    {
      q: "How does enrollment and payment through WhatsApp work?",
      a: "To ensure direct instructor guidance and tailored onboarding, enrollment is initiated via WhatsApp. Click the WhatsApp button, and the instructor will share course fees and payment instructions. Once completed, your subscription is verified in the Admin Dashboard, granting immediate access to all weekly materials.",
    },
    {
      q: "What learning materials are provided each week?",
      a: "Each week features an official, downloadable PDF study workbook containing vocabulary builders, conversational dialogues, pronunciation drills, grammar notes, and self-evaluation exercises.",
    },
    {
      q: "Can I access the PDF materials if I am not subscribed?",
      a: "No. All course materials are stored in private storage and strictly protected behind server-side authentication. Visitors and non-subscribed users can review the 8-week syllabus and learning objectives, but materials only unlock for students with an active, approved subscription.",
    },
    {
      q: "How is student course completion verified?",
      a: "Course completion is evaluated individually by the instructor upon review of your weekly assignments and final spoken evaluation. The completion counter on this page reflects genuine unique graduates.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar currentUser={user} subscriptionStatus={subscriptionStatus} />

      <main className="flex-1">
        {/* HERO SECTION — Speak English with Confidence */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E7E2D6] bg-gradient-to-b from-[#F5F2EB]/60 via-[#FBF9F5] to-[#FBF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE4] text-[#44403C] border border-[#DCD4C4] text-xs font-semibold tracking-wide shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                <span className="text-[#0F2D59] font-bold">Learn and Grow</span>
                <span className="text-[#A8A29E]">•</span>
                <span className="tracking-wider text-[11px] font-semibold text-[#57534E]">LEARN | IMPROVE | ACHIEVE</span>
                <span className="text-[#A8A29E] hidden sm:inline">•</span>
                <span className="hidden sm:inline text-[#15803D] font-medium">8-Week Course</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1C1917] tracking-tight leading-[1.15]">
                Speak English with{" "}
                <span className="text-[#C25E38] underline decoration-[#C25E38]/30 decoration-wavy decoration-2">
                  Confidence
                </span>
              </h1>

              {/* Compelling Description */}
              <p className="text-lg sm:text-xl text-[#57534E] leading-relaxed max-w-2xl mx-auto">
                {COURSE_CONFIG.tagline}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <Link
                  href="/course"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Explore Course Syllabus</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enroll via WhatsApp</span>
                </a>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#78716C]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>8 Weekly PDF Workbooks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Spoken English Drills</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Direct WhatsApp Instructor Support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Verified Course Completion</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE COURSE COMPLETION COUNTER */}
        <CourseCompletionCounter
          completedCount={stats.completedStudents}
          totalStudents={stats.totalStudents}
        />

        {/* COURSE HIGHLIGHTS SECTION */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
              Comprehensive Learning Pillars
            </span>
            <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight">
              Six Core Areas of English Mastery
            </h2>
            <p className="text-sm text-[#57534E]">
              Every weekly module combines these six essential components to build
              well-rounded, natural English communication skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSE_CONFIG.highlights.map((item, idx) => {
              const IconComponent = highlightIcons[idx % highlightIcons.length];
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E7E2D6] rounded-2xl p-6 space-y-3.5 beige-card-shadow hover:border-[#C25E38]/50 transition-all hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FBF0EB] text-[#C25E38] flex items-center justify-center font-bold">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1C1917]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8-WEEK LEARNING JOURNEY */}
        <section className="py-16 bg-[#F5F2EB]/50 border-y border-[#E7E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                Curriculum Progression
              </span>
              <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight">
                The 8-Week Learning Journey
              </h2>
              <p className="text-sm text-[#57534E]">
                Explore how each week systematically builds upon the previous,
                guiding you from foundational sentence patterns to fluent conversation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {weeks.map((week) => (
                <div
                  key={week.id}
                  className="bg-white border border-[#E7E2D6] rounded-xl p-5 flex flex-col justify-between hover:border-[#C25E38]/50 transition-all hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFECE4] text-[#C25E38] border border-[#DCD4C4]">
                        Week {String(week.weekNumber).padStart(2, "0")}
                      </span>
                      {week.pdfStoragePath ? (
                        <span className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> PDF Ready
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#78716C] font-medium">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#1C1917] line-clamp-2">
                      {week.title}
                    </h3>

                    <p className="text-xs text-[#57534E] line-clamp-3 leading-relaxed">
                      {week.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                    <span className="text-[#78716C] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#A8A29E]" /> Enrolled Only
                    </span>
                    <Link
                      href="/course"
                      className="text-[#C25E38] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Syllabus</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/course"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#292524] text-white hover:bg-[#1C1917] transition-all shadow-sm"
              >
                <span>Browse All 8 Modules on Course Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* STUDENT SUCCESS STORIES & REVIEWS */}
        <ReviewsSection
          initialReviews={approvedReviews}
          currentUser={user}
          userReview={userReview}
        />

        {/* ENROLLMENT PROCESS WORKFLOW */}
        <section className="py-16 bg-[#F5F2EB] border-t border-[#E7E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                Simple 5-Step Process
              </span>
              <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight">
                How English Course Enrollment Works
              </h2>
              <p className="text-sm text-[#57534E]">
                We handle enrollment directly via WhatsApp so you receive
                personal support before, during, and after payment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#C25E38] block mb-1">
                    STEP 01
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Explore Syllabus
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Review the 8-week English curriculum, lesson breakdowns, and practice milestones.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#15803D] block mb-1">
                    STEP 02
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    WhatsApp Contact
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Click WhatsApp to message the course administrator to inquire about tuition and batch schedules.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#B45309] block mb-1">
                    STEP 03
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Payment Details
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Receive course fee and payment instructions outside the website and complete your payment.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#292524] block mb-1">
                    STEP 04
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Admin Verification
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    The administrator verifies your payment and activates your student subscription via the dashboard.
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#15803D] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-sm">
                <div>
                  <span className="text-xs font-extrabold text-[#15803D] block mb-1">
                    STEP 05
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Unlocked Access
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Sign in to your account and immediately view or download all eight weeks of protected PDF workbooks!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action CTA inside workflow */}
            <div className="mt-10 p-6 rounded-2xl bg-white border border-[#D4CDBC] max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#1C1917]">
                  Ready to join the next English learning batch?
                </h4>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Get the official course fee and seat availability on WhatsApp.
                </p>
              </div>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shrink-0 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
              Got Questions?
            </span>
            <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#57534E]">
              Clear information on syllabus, payment, materials, and enrollment.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E7E2D6] rounded-xl p-6 transition-all shadow-xs"
              >
                <h3 className="text-base font-bold text-[#1C1917] mb-2 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#C25E38] shrink-0 mt-1" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed pl-6.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
