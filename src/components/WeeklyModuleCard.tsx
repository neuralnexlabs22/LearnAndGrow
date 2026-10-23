"use client";

import {
  Lock,
  Unlock,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { CourseWeek, SubscriptionStatus, UserRole } from "@/types";
import { getWeekInquiryWhatsAppUrl } from "@/lib/config";

interface WeeklyModuleCardProps {
  week: CourseWeek;
  hasAccess: boolean;
  userRole: UserRole | null;
  subscriptionStatus: SubscriptionStatus | null;
  onViewPdf: (week: CourseWeek) => void;
}

export function WeeklyModuleCard({
  week,
  hasAccess,
  userRole,
  subscriptionStatus,
  onViewPdf,
}: WeeklyModuleCardProps) {
  const isPdfAvailable = !!week.pdfStoragePath;
  const whatsAppInquiryUrl = getWeekInquiryWhatsAppUrl(
    week.weekNumber,
    week.title
  );

  const formattedSize = week.pdfFilesizeBytes
    ? `${(week.pdfFilesizeBytes / 1024).toFixed(1)} KB`
    : null;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 flex flex-col bg-white ${
        hasAccess
          ? "border-[#D4CDBC] hover:border-[#C25E38]/50 beige-card-shadow hover:shadow-lg"
          : "border-[#E7E2D6] bg-gradient-to-b from-white to-[#FDFBF7] shadow-sm"
      }`}
    >
      {/* Header Bar */}
      <div className="p-6 pb-4 border-b border-[#F0EBE0] flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 transition-colors ${
              hasAccess
                ? "bg-[#C25E38] text-white shadow-sm"
                : "bg-[#EFECE4] text-[#57534E] border border-[#DCD4C4]"
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase font-semibold opacity-85">
              Week
            </span>
            <span className="text-lg leading-tight">
              {String(week.weekNumber).padStart(2, "0")}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#78716C] border border-[#E7E2D6]">
                Module {week.weekNumber} of 8
              </span>

              {hasAccess ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  <Unlock className="w-3 h-3 text-[#059669]" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F2EB] text-[#78716C] border border-[#DCD4C4]">
                  <Lock className="w-3 h-3 text-[#A8A29E]" />
                  Subscription Required
                </span>
              )}

              {!week.isPublished && userRole === "admin" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Unpublished Draft
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-[#1C1917] tracking-tight leading-snug">
              {week.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <p className="text-sm text-[#57534E] leading-relaxed mb-5">
            {week.description}
          </p>

          {/* Core syllabus objectives */}
          {week.learningObjectives && week.learningObjectives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Key Learning Milestones
              </h4>
              <ul className="space-y-2">
                {week.learningObjectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#44403C]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Access Actions Area */}
        <div className="pt-4 border-t border-[#F0EBE0]">
          {hasAccess ? (
            /* UNLOCKED STATE */
            isPdfAvailable ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                    <FileText className="w-4 h-4 text-[#C25E38]" />
                    {week.pdfFilename}
                  </span>
                  {formattedSize && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#F5F2EB] text-[#78716C]">
                      {formattedSize}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onViewPdf(week)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#292524] hover:bg-[#1C1917] text-[#FAF8F5] transition-all shadow-sm active:scale-[0.99]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </button>

                  <a
                    href={`/api/materials/${week.weekNumber}/download`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#D4CDBC] transition-all active:scale-[0.99]"
                    download
                  >
                    <Download className="w-3.5 h-3.5 text-[#57534E]" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border border-[#E7E2D6] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B45309]" />
                  <span className="text-xs font-semibold text-[#92400E]">
                    Coming Soon
                  </span>
                </div>
                <span className="text-[11px] text-[#78716C]">
                  Instructor uploading material
                </span>
              </div>
            )
          ) : (
            /* LOCKED STATE */
            <div className="space-y-3">
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E7E2D6] flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-[#1C1917] block">
                    Protected Student Study Materials
                  </span>
                  <span className="text-[#78716C] text-[11px]">
                    PDF compendiums and exercises unlock after your WhatsApp
                    enrollment verification.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={whatsAppInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Unlock via WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
