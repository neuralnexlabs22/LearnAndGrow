"use client";

import { useEffect, useState } from "react";
import { X, Download, FileText, ExternalLink, Loader2 } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  title: string;
  pdfFilename: string | null;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  weekNumber,
  title,
  pdfFilename,
}: PdfViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

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

  if (!isOpen) return null;

  const viewUrl = `/api/materials/${weekNumber}/view`;
  const downloadUrl = `/api/materials/${weekNumber}/download`;

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
            <div className="w-10 h-10 rounded-xl bg-[#C25E38]/10 text-[#C25E38] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#C25E38] tracking-wider uppercase">
                  Week {weekNumber} Study Material
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#EFECE4] text-[#57534E] font-medium border border-[#DCD4C4]">
                  Official PDF
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#1C1917] truncate max-w-md sm:max-w-xl">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#292524] hover:bg-[#1C1917] text-[#FAF8F5] transition-colors shadow-sm"
              download
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>

            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE4] transition-colors ml-1"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / PDF Frame */}
        <div className="relative flex-1 bg-[#EAE5DA] flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5] z-10">
              <Loader2 className="w-8 h-8 text-[#C25E38] animate-spin mb-3" />
              <p className="text-sm font-medium text-[#57534E]">
                Verifying active subscription and decrypting study material...
              </p>
            </div>
          )}

          <iframe
            src={viewUrl}
            title={`Week ${weekNumber} Course PDF Viewer`}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-[#FAF8F5] border-t border-[#E7E2D6] text-xs text-[#78716C] flex items-center justify-between">
          <p className="truncate">
            Document: {pdfFilename || `Week-${weekNumber}-Materials.pdf`}
          </p>
          <p className="hidden sm:block text-[11px] text-[#A8A29E]">
            Private verified student transmission • Cache-restricted
          </p>
        </div>
      </div>
    </div>
  );
}
