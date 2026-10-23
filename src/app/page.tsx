import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  Download,
  Users,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { getCourseWeeks } from "@/lib/data-store";
import { COURSE_CONFIG, getEnrollmentWhatsAppUrl } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, subscriptionStatus } = await getCurrentSession();
  const weeks = await getCourseWeeks();
  const whatsAppUrl = getEnrollmentWhatsAppUrl(user?.email);

  const faqs = [
    {
      q: "How long does the student course take to complete?",
      a: "The course is strictly structured across 8 weeks. Each week is dedicated to a specific engineering milestone with comprehensive PDF notes, architectural diagrams, and lab exercises designed for 6 to 8 hours of focused study per week.",
    },
    {
      q: "How does the enrollment and payment process work?",
      a: "To ensure direct instructor support and tailored onboarding, enrollment is initiated via WhatsApp. Click the WhatsApp button, and the instructor will share the tuition details and direct payment instructions. Once completed, your subscription is approved in the Admin Dashboard, granting immediate access to all weekly materials.",
    },
    {
      q: "What learning materials are provided each week?",
      a: "Each of the eight weeks features an official, downloadable PDF compendium containing in-depth theoretical breakdowns, production code patterns, architecture schematics, security checklists, and hands-on milestones.",
    },
    {
      q: "Can I access the PDF materials if I am not subscribed?",
      a: "No. All course materials are stored in private storage and strictly protected behind server-side authentication. Visitors and non-subscribed users can review the 8-week syllabus and learning objectives, but materials only unlock for students with an active, approved subscription.",
    },
    {
      q: "What happens after my payment is verified?",
      a: "The course administrator approves your student account in the platform. Upon signing in, all 8 weekly modules will automatically switch to 'Unlocked', allowing you to view and download all PDFs at your own pace.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar currentUser={user} subscriptionStatus={subscriptionStatus} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E7E2D6] bg-gradient-to-b from-[#F5F2EB]/60 via-[#FBF9F5] to-[#FBF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE4] text-[#44403C] border border-[#DCD4C4] text-xs font-semibold tracking-wide shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#C25E38] animate-pulse" />
                <span>8-Week Structured Curriculum</span>
                <span className="text-[#A8A29E]">•</span>
                <span>Enrolling Now</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1C1917] tracking-tight leading-[1.15]">
                Master Full-Stack Web Engineering in{" "}
                <span className="text-[#C25E38] underline decoration-[#C25E38]/30 decoration-wavy decoration-2">
                  Eight Weeks
                </span>
              </h1>

              {/* Compelling Description */}
              <p className="text-lg sm:text-xl text-[#57534E] leading-relaxed max-w-2xl mx-auto">
                A rigorous, project-focused student syllabus. Weekly
                comprehensive PDF study compendiums, architecture deep-dives, and
                direct WhatsApp instructor advisory.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <Link
                  href="/course"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Explore 8-Week Curriculum</span>
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
                  <span>8 Weekly PDF Modules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Private Secure Storage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Direct WhatsApp Instructor Support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Verified Access Upon Payment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COURSE INTRODUCTION SECTION */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F5F2EB] text-[#78716C] text-xs font-bold uppercase tracking-wider border border-[#E7E2D6]">
                Course Introduction
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight leading-snug">
                Engineered for Serious Students & Aspiring Software Architects
              </h2>
              <p className="text-base text-[#57534E] leading-relaxed">
                Rather than skimming disconnected tutorials, this course breaks
                down enterprise full-stack development into eight coherent,
                cumulative learning units. From memory allocations and execution
                contexts to distributed WebSockets and containerized CI/CD
                pipelines, each week tackles a critical pillar of modern systems.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5 border border-[#A7F3D0]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917]">
                      Who This Course Is For
                    </h4>
                    <p className="text-xs text-[#57534E] mt-0.5">
                      Computer science students, self-taught developers, and
                      junior engineers seeking structured mastery over modern
                      TypeScript, React, Node.js, and relational databases.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5 border border-[#A7F3D0]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917]">
                      What You Will Learn
                    </h4>
                    <p className="text-xs text-[#57534E] mt-0.5">
                      How to build, secure, and deploy complete web applications
                      using battle-tested patterns, ACID database schemas, and
                      production observability.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Overview Callout */}
            <div className="lg:col-span-6">
              <div className="bg-[#F5F2EB] border border-[#D4CDBC] rounded-2xl p-6 sm:p-8 space-y-6 beige-card-shadow">
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E2D6]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                      Course At A Glance
                    </span>
                    <h3 className="text-lg font-bold text-[#1C1917]">
                      8 Weeks • 8 Comprehensive PDF Compendiums
                    </h3>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-[#292524] text-white text-xs font-semibold">
                    Intensive
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D6]">
                    <span className="text-2xl font-bold text-[#1C1917] block">
                      8
                    </span>
                    <span className="text-xs font-medium text-[#78716C]">
                      Weekly Modules
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D6]">
                    <span className="text-2xl font-bold text-[#C25E38] block">
                      100%
                    </span>
                    <span className="text-xs font-medium text-[#78716C]">
                      PDF Material Depth
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D6]">
                    <span className="text-2xl font-bold text-[#15803D] block">
                      1-on-1
                    </span>
                    <span className="text-xs font-medium text-[#78716C]">
                      WhatsApp Instructor Advisory
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D6]">
                    <span className="text-2xl font-bold text-[#1C1917] block">
                      Protected
                    </span>
                    <span className="text-xs font-medium text-[#78716C]">
                      Private Storage Access
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/course"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#292524] hover:bg-[#1C1917] text-white transition-colors"
                  >
                    <span>View Full 8-Week Syllabus</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8-WEEK OVERVIEW GRID */}
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
                guiding you from fundamentals to production readiness.
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

        {/* WHAT STUDENTS RECEIVE SECTION */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
              Comprehensive Value
            </span>
            <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight">
              What You Receive as an Enrolled Student
            </h2>
            <p className="text-sm text-[#57534E]">
              Everything you need to master full-stack software architecture
              with zero distractions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E7E2D6] rounded-2xl p-6 space-y-3.5 beige-card-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#FBF0EB] text-[#C25E38] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Weekly In-Depth PDF Materials
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Downloadable PDF compendiums for every single week containing
                architectural diagrams, practical code exercises, and checklist
                standards.
              </p>
            </div>

            <div className="bg-white border border-[#E7E2D6] rounded-2xl p-6 space-y-3.5 beige-card-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#15803D] flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Direct WhatsApp Instructor Channel
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Have questions regarding a weekly module or code pattern? Reach
                out directly to the course administrator on WhatsApp for 1-on-1
                guidance.
              </p>
            </div>

            <div className="bg-white border border-[#E7E2D6] rounded-2xl p-6 space-y-3.5 beige-card-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Private Verified Student Access
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Course materials are safeguarded behind private storage. You
                enjoy lifetime access to all eight weekly modules once your
                subscription is approved.
              </p>
            </div>
          </div>
        </section>

        {/* ENROLLMENT PROCESS WORKFLOW */}
        <section className="py-16 bg-[#F5F2EB] border-t border-[#E7E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                Simple 5-Step Process
              </span>
              <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight">
                How Student Enrollment & Access Works
              </h2>
              <p className="text-sm text-[#57534E]">
                We handle enrollment directly via WhatsApp so you receive
                personal support before, during, and after payment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Step 1 */}
              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#C25E38] block mb-1">
                    STEP 01
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Explore Syllabus
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Review the 8-week curriculum, prerequisites, and weekly
                    learning outcomes on the platform.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#15803D] block mb-1">
                    STEP 02
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    WhatsApp Contact
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Click the WhatsApp button to message the course
                    administrator to inquire about course fees and enrollment.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#B45309] block mb-1">
                    STEP 03
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Payment Details
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Receive the course fee and payment instructions outside the
                    platform and complete the transaction.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-[#D4CDBC] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <span className="text-xs font-extrabold text-[#292524] block mb-1">
                    STEP 04
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Admin Verification
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    The administrator verifies your payment and approves your
                    student subscription via the Admin Dashboard.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-[#FAF8F5] border-2 border-[#15803D] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-sm">
                <div>
                  <span className="text-xs font-extrabold text-[#15803D] block mb-1">
                    STEP 05
                  </span>
                  <h4 className="text-sm font-bold text-[#1C1917]">
                    Unlocked Access
                  </h4>
                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    Sign in to your account and immediately view or download all
                    eight weeks of protected course PDFs!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action CTA inside workflow */}
            <div className="mt-10 p-6 rounded-2xl bg-white border border-[#D4CDBC] max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#1C1917]">
                  Ready to enroll in the upcoming 8-week batch?
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
