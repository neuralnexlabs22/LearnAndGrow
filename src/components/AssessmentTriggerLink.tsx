"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { openFreeAssessment } from "./AssessmentFirstVisitOverlay";

interface AssessmentTriggerLinkProps {
  className?: string;
  variant?: "link" | "button";
  showIcon?: boolean;
}

export function AssessmentTriggerLink({
  className = "",
  variant = "link",
  showIcon = true,
}: AssessmentTriggerLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined") {
      e.preventDefault();
      openFreeAssessment(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        }
      >
        {showIcon && <Sparkles className="w-4 h-4 text-emerald-300" />}
        <span>Take Free Assessment</span>
        <ArrowRight className="w-4 h-4 ml-0.5" />
      </button>
    );
  }

  return (
    <Link
      href="/assessment"
      onClick={handleClick}
      className={
        className ||
        "inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#15803D] hover:text-[#166534] transition-colors underline decoration-[#15803D]/40 decoration-2 underline-offset-4 cursor-pointer"
      }
    >
      {showIcon && <Sparkles className="w-4 h-4 text-[#15803D] shrink-0" />}
      <span>Take Free English Assessment →</span>
    </Link>
  );
}
