import Link from "next/link";
import { MessageCircle, ShieldCheck, ArrowUpRight } from "lucide-react";
import { COURSE_CONFIG, getEnrollmentWhatsAppUrl } from "@/lib/config";

export function Footer() {
  const whatsAppUrl = getEnrollmentWhatsAppUrl();

  return (
    <footer className="mt-auto bg-[#F5F2EB] border-t border-[#E7E2D6] text-[#57534E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Overview */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#D4CDBC] p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/logo.png"
                  alt="Learn and Grow Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#0F2D59]">
                  Learn <span className="text-[#2E7D32]">and</span> Grow
                </span>
                <p className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase">
                  LEARN | IMPROVE | ACHIEVE
                </p>
              </div>
            </div>

            <p className="text-xs text-[#78716C] font-semibold">
              {COURSE_CONFIG.courseTitle}
            </p>

            <p className="text-sm text-[#78716C] max-w-md leading-relaxed">
              An 8-week structured English learning curriculum. Weekly
              PDF workbooks, conversational drills, and dedicated instructor
              guidance via WhatsApp.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFECE4] text-[#44403C] border border-[#DCD4C4]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                Private Verified Student Access
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFECE4] text-[#44403C] border border-[#DCD4C4]">
                8 Weekly English Modules
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-[#1C1917] uppercase mb-4">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#1C1917] transition-colors flex items-center gap-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/course"
                  className="hover:text-[#1C1917] transition-colors flex items-center gap-1"
                >
                  Course (8 Weeks)
                </Link>
              </li>
              <li>
                <Link
                  href="/assessment"
                  className="hover:text-[#15803D] font-semibold text-[#15803D] transition-colors flex items-center gap-1"
                >
                  Free English Assessment
                </Link>
              </li>
              <li>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1C1917] transition-colors flex items-center gap-1"
                >
                  WhatsApp Contact
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-[#B45309] transition-colors flex items-center gap-1 text-xs text-[#78716C] pt-1"
                >
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Enrollment & WhatsApp Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-[#1C1917] uppercase mb-4">
              Contact & Enrollment
            </h4>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Course tuition, payment verification, and enrollment questions are
              handled directly with the instructor via WhatsApp.
            </p>
            <div className="space-y-1.5 text-xs text-[#44403C] pt-1">
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1C1917]">Phone:</span>
                <a href="tel:+918148440389" className="hover:text-[#15803D] hover:underline">
                  +91 81484 40389
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1C1917]">Email:</span>
                <a href="mailto:learnandgrow050518@gmail.com" className="hover:text-[#15803D] hover:underline">
                  learnandgrow050518@gmail.com
                </a>
              </p>
            </div>
            <div className="pt-2">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-sm transition-all hover:shadow"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Message on WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E7E2D6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <p className="font-semibold text-[#44403C]">
            Learn and Grow — Learn Today. Communicate Better. Grow Tomorrow.
          </p>
          <p className="flex items-center gap-2" suppressHydrationWarning>
            <span>© {new Date().getFullYear()} Learn and Grow</span>
            <span>•</span>
            <span>8-Week Spoken English Course</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
