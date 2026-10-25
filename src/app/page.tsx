import Link from "next/link";
import Image from "next/image";
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
  GraduationCap,
  Briefcase,
  Building2,
  Compass,
  PhoneCall,
  Clock,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import {
  getCourseWeeks,
  getApprovedReviews,
  getStudentReview,
  getDashboardStats,
  getCoursePricing,
} from "@/lib/data-store";
import { COURSE_CONFIG, getEnrollmentWhatsAppUrl, getPriceOfferWhatsAppUrl } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCompletionCounter } from "@/components/CourseCompletionCounter";
import { ReviewsSection } from "@/components/ReviewsSection";
import { AssessmentFirstVisitOverlay } from "@/components/AssessmentFirstVisitOverlay";
import { AssessmentHeroBanner } from "@/components/AssessmentHeroBanner";
import { AssessmentTriggerLink } from "@/components/AssessmentTriggerLink";
import { PriceBreakdownCard } from "@/components/PriceBreakdownCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { user, subscriptionStatus } = await getCurrentSession();
  const [weeks, approvedReviews, stats, pricing] = await Promise.all([
    getCourseWeeks(),
    getApprovedReviews(),
    getDashboardStats(),
    getCoursePricing(),
  ]);

  let userReview = null;
  if (user && user.role === "student") {
    userReview = await getStudentReview(user.id);
  }

  const whatsAppUrl = getPriceOfferWhatsAppUrl(
    pricing.originalPrice,
    pricing.sellingPrice,
    pricing.currency,
    user?.email
  );

  // 5 Target Audience Groups
  const targetAudience = [
    {
      title: "College Students",
      desc: "Prepare for campus interviews, seminar presentations, group discussions, and fluent everyday interactions.",
      icon: GraduationCap,
      badge: "Campus & Seminars",
      accent: "from-blue-600/10 to-indigo-600/10 text-blue-700",
    },
    {
      title: "Job Seekers",
      desc: "Build self-introduction confidence, practice common interview questions, and overcome nervousness during recruitment.",
      icon: Briefcase,
      badge: "Interview Ready",
      accent: "from-emerald-600/10 to-teal-600/10 text-emerald-700",
    },
    {
      title: "Working Professionals",
      desc: "Communicate clearly in team meetings, status calls, client discussions, professional emails, and workplace presentations.",
      icon: Building2,
      badge: "Workplace Growth",
      accent: "from-amber-600/10 to-orange-600/10 text-amber-700",
    },
    {
      title: "English Beginners",
      desc: "Start from basic sentence formation, eliminate hesitation, understand grammar rules simply, and speak without fear.",
      icon: Compass,
      badge: "Strong Basics",
      accent: "from-rose-600/10 to-red-600/10 text-rose-700",
    },
    {
      title: "Anyone Improving Communication Skills",
      desc: "Broaden your vocabulary, improve pronunciation clarity, master social conversations, and speak with natural ease.",
      icon: Users,
      badge: "Daily Fluency",
      accent: "from-purple-600/10 to-violet-600/10 text-purple-700",
    },
  ];

  // 8 Course Benefits
  const courseBenefits = [
    {
      title: "Simple and Practical English Lessons",
      desc: "Learn through bite-sized, real-life examples designed for adult learners, focusing on conversational usage rather than rigid rules.",
      icon: BookOpen,
    },
    {
      title: "Grammar Explained in an Easy Way",
      desc: "Understand tenses, sentence formation, and sentence structure with clear, straightforward explanations that eliminate confusion.",
      icon: CheckCircle2,
    },
    {
      title: "Everyday Conversation Practice",
      desc: "Build conversational reflexes for daily scenarios: greetings, asking questions, ordering, expressing opinions, and casual dialogue.",
      icon: MessageSquare,
    },
    {
      title: "Vocabulary Building",
      desc: "Expand your active word bank with high-frequency expressions, collocations, phrasal verbs, and natural transitions.",
      icon: Sparkles,
    },
    {
      title: "Pronunciation and Listening Practice",
      desc: "Sharpen acoustic comprehension, vowel clarity, syllable stress, rhythm, and understand fast-paced native speech.",
      icon: Headphones,
    },
    {
      title: "Interview Preparation",
      desc: "Practice confident self-introductions, behavioral answers, professional body language, and articulateness for career opportunities.",
      icon: Briefcase,
    },
    {
      title: "Workplace and Professional English",
      desc: "Communicate effectively in office meetings, client emails, team briefings, status reports, and business correspondence.",
      icon: Building2,
    },
    {
      title: "Assessments to Track Your Progress",
      desc: "Regular self-checks, grammar assessments, and constructive feedback milestones to measure your tangible growth.",
      icon: Award,
    },
  ];

  // Fallback 8 weeks metadata if empty
  const defaultEightWeeks = [
    {
      weekNumber: 1,
      title: "Week 1 — English Foundations",
      description: "Learn sentence formation, basic vocabulary, and how to introduce yourself confidently.",
    },
    {
      weekNumber: 2,
      title: "Week 2 — Grammar and Tenses",
      description: "Understand essential grammar rules and learn to use present, past, and future tenses.",
    },
    {
      weekNumber: 3,
      title: "Week 3 — Vocabulary and Daily English",
      description: "Improve your vocabulary and learn useful expressions for everyday situations.",
    },
    {
      weekNumber: 4,
      title: "Week 4 — Spoken English Practice",
      description: "Practise conversations, asking questions, answering confidently, and expressing your thoughts.",
    },
    {
      weekNumber: 5,
      title: "Week 5 — Pronunciation and Listening",
      description: "Improve pronunciation, listening skills, clarity, and fluency.",
    },
    {
      weekNumber: 6,
      title: "Week 6 — Reading and Writing",
      description: "Learn to write clear messages, emails, and simple paragraphs in English.",
    },
    {
      weekNumber: 7,
      title: "Week 7 — Interview and Workplace English",
      description: "Practise interview answers, professional conversations, meetings, and workplace communication.",
    },
    {
      weekNumber: 8,
      title: "Week 8 — Revision and Final Assessment",
      description: "Review what you have learned and assess your progress.",
    },
  ];

  const faqs = [
    {
      q: "How long is the Spoken English Course?",
      a: "The course is structured across 8 practical weeks. Each week targets a specific communication milestone — from grammar foundations and sentence formation to workplace English and live conversational practice.",
    },
    {
      q: "How does enrollment and payment through WhatsApp work?",
      a: "To provide direct guidance and personalized batch placement, enrollment is initiated via WhatsApp. Simply click the WhatsApp button, and the course administrator will share course fees, duration, and enrollment instructions. Once confirmed, your subscription is activated for immediate workbook access.",
    },
    {
      q: "What learning materials are included each week?",
      a: "Each week includes an official downloadable PDF study workbook with vocabulary builders, conversational dialogues, pronunciation drills, grammar notes, and self-evaluation exercises.",
    },
    {
      q: "Can I access the PDF workbooks without subscribing?",
      a: "No. Course materials are kept in private storage and strictly protected behind server-side authentication. Visitors can explore the complete 8-week syllabus, while materials unlock for students with an active, approved subscription.",
    },
    {
      q: "How does the Free English Grammar Assessment work?",
      a: "Our free 20-question assessment covers Beginner, Intermediate, and Advanced questions. It provides your instant score (e.g. 16/20), accuracy percentage, proficiency badge, feedback, and a direct WhatsApp link to share your results with the instructor.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* First-Visit Assessment Overlay for New Visitors */}
      <AssessmentFirstVisitOverlay />

      <Navbar currentUser={user} subscriptionStatus={subscriptionStatus} />

      <main className="flex-1">
        {/* ================================================================= */}
        {/* 1. OPENING HERO SECTION — PRIMARY DESIGN PRIORITY                */}
        {/* ================================================================= */}
        <section
          aria-label="Spoken English Course Hero"
          className="relative min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden bg-[#FAF8F5] text-[#1C1917] border-b border-[#E7E2D6]"
        >
          {/* Authentic College Students Photograph as Full-Width Hero Background (Prominent on Right) */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[68%] xl:w-[64%] z-0 overflow-hidden">
            <img
              src="/images/college-students-speaking-english.jpg"
              alt="Diverse group of college-age adult students deeply engaged in an active spoken English conversation around a study table with notebooks and laptop"
              className="w-full h-full object-cover object-[52%_center] lg:object-[48%_center]"
              loading="eager"
              fetchPriority="high"
            />
            {/* Seamless warm fade to the left so headline and description have pristine white space */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent hidden lg:block" />
            {/* Mobile soft overlay for text readability on small phones */}
            <div className="absolute inset-0 bg-[#FAF8F5]/85 lg:hidden" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="max-w-xl lg:max-w-[32rem] space-y-6 text-left">
              {/* Eyebrow text */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#DCD4C4] text-xs sm:text-sm font-semibold tracking-wide text-[#15803D] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                <span>LEARN AND GROW | 8-WEEK SPOKEN ENGLISH COURSE</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-extrabold tracking-tight text-[#0A192F] leading-[1.14]">
                Speak English with Confidence.{" "}
                <span className="text-[#15803D]">
                  Grow Your Future.
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-[#44403C] leading-relaxed font-normal">
                Improve your English communication skills with our practical 8-week Spoken English Course.
                Build confidence in everyday conversations, grammar, vocabulary, pronunciation, interviews,
                and professional communication.
              </p>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Primary CTA */}
                <Link
                  href="/course"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-center"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Explore the Course</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                {/* Secondary CTA */}
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm sm:text-base font-bold bg-white hover:bg-[#F5F2EB] text-[#0F2D59] border border-[#DCD4C4] shadow-sm transition-all active:scale-[0.98] text-center"
                >
                  <MessageCircle className="w-5 h-5 fill-[#15803D] text-[#15803D]" />
                  <span>Join via WhatsApp</span>
                </a>
              </div>

              {/* Distinct Assessment Link */}
              <div className="pt-1">
                <AssessmentTriggerLink />
              </div>

              {/* Key Trust Signals */}
              <div className="pt-3 border-t border-[#E7E2D6] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#57534E] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>8 Weekly PDF Workbooks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Practical Spoken Drills</span>
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

        {/* ================================================================= */}
        {/* 2. DEDICATED FREE ASSESSMENT PROMOTION SECTION                   */}
        {/* ================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
          <AssessmentHeroBanner />
        </section>

        {/* ================================================================= */}
        {/* 3. WHO CAN JOIN LEARN AND GROW?                                  */}
        {/* ================================================================= */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              Tailored For Adult Learners
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
              Who Can Join Learn and Grow?
            </h2>
            <p className="text-base text-[#57534E]">
              Designed for anyone ready to communicate better.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {targetAudience.map((audience, idx) => {
              const Icon = audience.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E7E2D6] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-[#15803D]/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${audience.accent} flex items-center justify-center font-bold transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#78716C] bg-[#F5F2EB] px-2.5 py-0.5 rounded-full">
                      {audience.badge}
                    </span>
                    <h3 className="text-base font-bold text-[#1C1917]">
                      {audience.title}
                    </h3>
                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {audience.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0EBE0] flex items-center gap-1.5 text-xs text-[#15803D] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>8-Week Track</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. WHY CHOOSE LEARN AND GROW? (PRACTICAL ENGLISH)                 */}
        {/* ================================================================= */}
        <section className="py-16 md:py-24 bg-[#F5F2EB]/60 border-y border-[#E7E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
                Why Choose Learn and Grow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
                Practical English for Real-Life Situations
              </h2>
              <p className="text-base text-[#57534E]">
                Learn English in a simple, practical way and gradually build the confidence to
                communicate in everyday and professional environments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courseBenefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#E7E2D6] rounded-2xl p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-[#15803D]/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-[#1C1917]">
                        {benefit.title}
                      </h3>
                      <p className="text-xs text-[#57534E] leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F5F2EB] flex items-center text-[11px] font-medium text-[#78716C] gap-1">
                      <span>Module Pillar {idx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. OUR 8-WEEK LEARNING PROGRAM                                   */}
        {/* ================================================================= */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              Complete Course Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
              Your Journey to Better English Starts Here
            </h2>
            <p className="text-base text-[#57534E]">
              An eight-week learning path designed to strengthen your grammar and communication skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(weeks.length > 0 ? weeks : defaultEightWeeks).map((weekItem: any) => {
              const weekNum = weekItem.weekNumber;
              const hasPdf = Boolean(weekItem.pdfStoragePath);
              return (
                <div
                  key={weekItem.id || weekNum}
                  className="bg-white border border-[#E7E2D6] rounded-2xl p-5 flex flex-col justify-between hover:border-[#15803D]/50 transition-all hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFECE4] text-[#15803D] border border-[#DCD4C4]">
                        Week {String(weekNum).padStart(2, "0")}
                      </span>
                      {hasPdf ? (
                        <span className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> PDF Ready
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#78716C] font-medium">
                          Syllabus Available
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#1C1917] line-clamp-2">
                      {weekItem.title}
                    </h3>

                    <p className="text-xs text-[#57534E] line-clamp-3 leading-relaxed">
                      {weekItem.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                    <span className="text-[#78716C] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#A8A29E]" /> Enrolled Only
                    </span>
                    <Link
                      href="/course"
                      className="text-[#15803D] font-semibold hover:text-[#166534] transition-colors flex items-center gap-0.5"
                    >
                      <span>Syllabus</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-[#0F2D59] text-white hover:bg-[#0A1F3D] transition-all shadow-md hover:shadow-lg"
            >
              <span>Explore Full 8-Week Syllabus & Learning Objectives</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ================================================================= */}
        {/* COURSE FEE & PRICE BREAKDOWN                                      */}
        {/* ================================================================= */}
        <section className="py-14 sm:py-20 bg-[#F5F2EB] border-b border-[#E7E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#D4CDBC] rounded-3xl p-6 sm:p-10 beige-card-shadow">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    {pricing.offerTag || "Course Fee Structure"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8E3D7] text-[#44403C]">
                    One-Time Payment • No Subscriptions
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-tight">
                  Transparent, All-Inclusive Course Fee
                </h2>

                <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
                  Join our structured 8-week Spoken English Course with simple, transparent pricing. Pay once and receive complete lifetime access to all 8 modules, 8 downloadable PDF workbooks, personalized pronunciation guidance, and direct instructor mentoring via WhatsApp.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1C1917]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Complete 8-Week Curriculum</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1C1917]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>8 Comprehensive PDF Workbooks</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1C1917]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Direct WhatsApp Instructor Support</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1C1917]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Official Certificate of Completion</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <PriceBreakdownCard pricing={pricing} userEmail={user?.email} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 6. LIVE COURSE COMPLETION COUNTER                                 */}
        {/* ================================================================= */}
        <CourseCompletionCounter
          completedCount={stats.completedStudents}
          totalStudents={stats.totalStudents}
        />

        {/* ================================================================= */}
        {/* 7. STUDENT SUCCESS AND REVIEWS ("Every Step Forward Matters")     */}
        {/* ================================================================= */}
        <ReviewsSection
          initialReviews={approvedReviews}
          currentUser={user}
          userReview={userReview}
        />

        {/* ================================================================= */}
        {/* 8. COURSE ENROLLMENT CTA (Near Bottom)                            */}
        {/* ================================================================= */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#0F2D59] via-[#163B70] to-[#0A192F] text-white border-y border-[#1E457A]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ENROLLMENT OPEN</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Start Your English Learning Journey Today!
            </h2>

            <p className="text-base sm:text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed">
              Take the first step towards speaking English with greater confidence. Contact Learn and Grow to know more about the course, fees, duration, and enrolment.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-xl hover:shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
                <span>Enquire on WhatsApp</span>
              </a>

              <Link
                href="/course"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-center"
              >
                <BookOpen className="w-5 h-5" />
                <span>View Course Syllabus</span>
              </Link>
            </div>

            <p className="text-xs text-stone-300 pt-2">
              Instant response from course administrator • Pre-filled enquiry message ready to send
            </p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 9. TRANSPARENT 5-STEP ENROLLMENT WORKFLOW                         */}
        {/* ================================================================= */}
        <section className="py-16 bg-[#F5F2EB] border-b border-[#E7E2D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
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
                  <span className="text-xs font-extrabold text-[#15803D] block mb-1">
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
          </div>
        </section>

        {/* ================================================================= */}
        {/* 10. FREQUENTLY ASKED QUESTIONS                                   */}
        {/* ================================================================= */}
        <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
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
                  <HelpCircle className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
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
