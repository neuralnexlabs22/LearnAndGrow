"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-semibold text-[#1C1917]">{title}</h3>
            <p className="text-sm text-[#57534E] leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE4] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 ${
              isDestructive
                ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                : "bg-[#C25E38] hover:bg-[#A94E2C]"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
