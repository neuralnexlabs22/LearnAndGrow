"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Lock,
  Unlock,
  FileText,
  FileCode,
  ExternalLink,
  Download,
  Eye,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  CompleteCourseSettings,
  CompleteCourseResource,
  UserProfile,
} from "@/types";
import { getCompleteCourseWhatsAppUrl } from "@/lib/config";
import { CompleteCourseResourceModal } from "./CompleteCourseResourceModal";

interface CompleteCourseSectionProps {
  settings: CompleteCourseSettings;
  resources: CompleteCourseResource[];
  hasCompleteCourseAccess: boolean;
  currentUser: UserProfile | null;
}

export function CompleteCourseSection({
  settings,
  resources,
  hasCompleteCourseAccess,
  currentUser,
}: CompleteCourseSectionProps) {
  const [activeResource, setActiveResource] = useState<CompleteCourseResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const whatsAppUrl = getCompleteCourseWhatsAppUrl(currentUser?.email);
  const totalCount = resources.length || settings.totalResources || 3;

  const handleOpenResource = (res: CompleteCourseResource) => {
    setActiveResource(res);
    setIsModalOpen(true);
  };

  return (
    <section className="mt-14" aria-labelledby="complete-course-heading">
      {/* SECTION HEADER & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] bg-[#C25E38]/10 px-2.5 py-0.5 rounded-full border border-[#C25E38]/20">
              Specialized Learning Track
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8E3D7] text-[#44403C]">
              Independent Course Access
            </span>
          </div>
          <h2
            id="complete-course-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight mt-1.5"
          >
            {settings.title || "Complete Course"}
          </h2>
        </div>

        {/* ACCESS STATUS BADGE */}
        <div className="flex items-center gap-2">
          {hasCompleteCourseAccess ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] shadow-2xs">
              <Unlock className="w-3.5 h-3.5 text-[#059669]" />
              <span>Complete Course Access Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F5F2EB] text-[#78716C] border border-[#D4CDBC] shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Complete Course Locked</span>
            </span>
          )}
        </div>
      </div>

      {/* MAIN COMPLETE COURSE HERO CARD */}
      <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F5F2EB] to-[#ECE7DC] border-2 border-[#D4CDBC] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C25E38]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT: Course Info & Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold tracking-tight px-3 py-1 rounded-full bg-white text-[#0F2D59] border border-[#D4CDBC] shadow-2xs">
                  Learn <span className="text-[#2E7D32]">and</span> Grow
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#57534E] border border-[#D4CDBC] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C25E38]" />
                  <span>{totalCount} Total Learning Resources</span>
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#15803D] border border-[#D4CDBC] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Study Materials</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
                {settings.title || "Complete Course"}
              </h3>

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
                {settings.description ||
                  "Get access to the complete English learning course, including all learning materials and additional resources provided by Learn and Grow."}
              </p>
            </div>

            {/* KEY FEATURES LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#292524]">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Complete Grammar & Practice Handbooks (PDF)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#292524]">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Editable Dialogue & Exercise Docs (Word)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#292524]">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Pronunciation & Phonics External Resources</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#292524]">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Independent from 8-Week Weekly Modules</span>
              </div>
            </div>

            {/* ACTION AREA: UNLOCKED VS LOCKED */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {hasCompleteCourseAccess ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#065F46] bg-[#ECFDF5] px-4 py-2.5 rounded-xl border border-[#A7F3D0]">
                  <Unlock className="w-4 h-4 text-[#059669]" />
                  <span>All Complete Course resources below are fully unlocked for your account.</span>
                </div>
              ) : (
                <>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-sm transition-all hover:shadow active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Unlock Complete Course via WhatsApp</span>
                  </a>

                  {!currentUser && (
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-[#F5F2EB] text-[#1C1917] border border-[#D4CDBC] shadow-2xs transition-colors"
                    >
                      <span>Sign In to Check Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Cover Card / Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#D4CDBC] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#1E3A8A] flex flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    Learn and Grow
                  </span>
                  {hasCompleteCourseAccess ? (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-full">
                      Access Granted
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-black/40 text-stone-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xl font-extrabold tracking-tight">
                    Complete English Course
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    All-in-one resource pack, PDF guides, editable workbooks & links.
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#57534E] space-y-1.5 border-t border-[#E7E2D6] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Resources:</span>
                  <span className="font-bold text-[#1C1917]">{totalCount} Materials</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Course Access:</span>
                  <span
                    className={`font-bold ${
                      hasCompleteCourseAccess ? "text-[#15803D]" : "text-[#78716C]"
                    }`}
                  >
                    {hasCompleteCourseAccess ? "Granted & Active" : "Separate Permission Required"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Instructor Support:</span>
                  <span className="font-bold text-[#1C1917]">Direct WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESOURCES LIST AREA */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1C1917]">
            Complete Course Resources & Study Materials
          </h3>
          <span className="text-xs font-semibold text-[#78716C]">
            {hasCompleteCourseAccess
              ? `${resources.length} Available`
              : "Access Locked"}
          </span>
        </div>

        {hasCompleteCourseAccess ? (
          /* UNLOCKED STATE: SHOW ALL PUBLISHED RESOURCES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => {
              const isPdf = res.resourceType === "pdf";
              const isDoc = res.resourceType === "doc";
              const isLink = res.resourceType === "link";

              return (
                <div
                  key={res.id}
                  className="bg-white border border-[#E7E2D6] rounded-2xl p-5 hover:border-[#D4CDBC] hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isPdf
                            ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                            : isDoc
                            ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                            : "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
                        }`}
                      >
                        {isPdf && <FileText className="w-3 h-3" />}
                        {isDoc && <FileCode className="w-3 h-3" />}
                        {isLink && <ExternalLink className="w-3 h-3" />}
                        <span>
                          {isPdf
                            ? "PDF Document"
                            : isDoc
                            ? "Word Document"
                            : "External Resource"}
                        </span>
                      </span>

                      {res.fileSizeBytes && (
                        <span className="text-[11px] text-[#78716C] font-mono">
                          {(res.fileSizeBytes / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#1C1917] leading-snug">
                        {res.title}
                      </h4>
                      {res.description && (
                        <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F5F2EB] flex items-center gap-2 mt-4">
                    {isLink ? (
                      <a
                        href={res.externalUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white transition-colors"
                      >
                        <span>Open Learning Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenResource(res)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#D4CDBC] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isDoc ? "Preview" : "View"}</span>
                        </button>

                        <a
                          href={`/api/complete-course/resources/${res.id}/download`}
                          download
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#292524] hover:bg-[#1C1917] text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LOCKED STATE: SHOW PROTECTED PREVIEW (DO NOT EXPOSE PROTECTED URLS OR CONTENTS) */
          <div className="bg-[#FAF8F5] border-2 border-dashed border-[#D4CDBC] rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EFECE4] text-[#78716C] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-[#1C1917]">
                Complete Course Materials Protected
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                This comprehensive resource collection is managed under a separate Complete Course permission. To unlock all PDFs, editable Word study sheets, and interactive practice portals, please contact the instructor via WhatsApp.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enquire & Unlock Complete Course on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* RESOURCE PREVIEW / VIEW MODAL */}
      <CompleteCourseResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resource={activeResource}
      />
    </section>
  );
}

