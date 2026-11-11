"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  FileText,
  ExternalLink,
  Loader2,
  BookOpen,
  CheckCircle2,
  FileCode,
} from "lucide-react";
import { CompleteCourseResource } from "@/types";

interface CompleteCourseResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: CompleteCourseResource | null;
}

export function CompleteCourseResourceModal({
  isOpen,
  onClose,
  resource,
}: CompleteCourseResourceModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const fileName = resource?.fileName || "";
  const lowerFilename = fileName.toLowerCase();
  const isWordDoc =
    resource?.resourceType === "doc" ||
    lowerFilename.endsWith(".docx") ||
    lowerFilename.endsWith(".doc");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !resource) return null;

  const viewUrl = `/api/complete-course/resources/${resource.id}/view`;
  const downloadUrl = `/api/complete-course/resources/${resource.id}/download`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1C1917]/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F5F2EB] border-b border-[#E7E2D6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isWordDoc
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "bg-[#C25E38]/10 text-[#C25E38]"
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold tracking-wider uppercase ${
                    isWordDoc ? "text-[#2563EB]" : "text-[#C25E38]"
                  }`}
                >
                  Complete Course Material
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
                    isWordDoc
                      ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                      : "bg-[#EFECE4] text-[#57534E] border-[#DCD4C4]"
                  }`}
                >
                  {isWordDoc ? "Word Document (.docx)" : "Official Study PDF"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#1C1917] truncate max-w-md sm:max-w-xl">
                {resource.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#FAF8F5] transition-colors shadow-sm ${
                isWordDoc
                  ? "bg-[#1D4ED8] hover:bg-[#1E40AF]"
                  : "bg-[#292524] hover:bg-[#1C1917]"
              }`}
              download
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isWordDoc ? "Download Word Doc" : "Download PDF"}
              </span>
            </a>

            {!isWordDoc && (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE4] transition-colors ml-1"
              aria-label="Close Document Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isWordDoc ? (
          <div className="relative flex-1 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 max-w-lg w-full shadow-lg space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] mx-auto flex items-center justify-center shadow-inner">
                <FileCode className="w-8 h-8 text-[#1D4ED8]" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF]">
                  <BookOpen className="w-3.5 h-3.5" />
                  Complete Course Learning Material
                </span>
                <h4 className="text-lg font-bold text-[#0F172A]">{resource.title}</h4>
                {resource.description && (
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {resource.description}
                  </p>
                )}
                <p className="text-xs text-[#64748B] font-mono break-all bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                  {resource.fileName || "Study-Material.docx"}
                  {resource.fileSizeBytes
                    ? ` • ${(resource.fileSizeBytes / 1024).toFixed(1)} KB`
                    : ""}
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] text-left text-xs text-[#334155] space-y-2">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Ready for Download & Study</span>
                </div>
                <p className="text-[#64748B] leading-relaxed">
                  This document is provided in Microsoft Word format (.docx/.doc). You can download and open it with Microsoft Word, Google Docs, or LibreOffice on any device.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={downloadUrl}
                  download
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 bg-[#EAE5DA] flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5] z-10">
                <Loader2 className="w-8 h-8 text-[#C25E38] animate-spin mb-3" />
                <p className="text-sm font-medium text-[#57534E]">
                  Verifying Complete Course access and loading study document...
                </p>
              </div>
            )}

            <iframe
              src={viewUrl}
              title={`${resource.title} Viewer`}
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-[#FAF8F5] border-t border-[#E7E2D6] text-xs text-[#78716C] flex items-center justify-between">
          <p className="truncate">
            Document: {resource.fileName || `${resource.title}.pdf`}
          </p>
          <p className="hidden sm:block text-[11px] text-[#A8A29E]">
            Private verified student transmission • Cache-restricted
          </p>
        </div>
      </div>
    </div>
  );
}
