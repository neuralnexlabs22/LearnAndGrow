"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  MessageCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { AssessmentEvaluationResult, AssessmentLevel } from "@/types";

interface AssessmentResultCardProps {
  result: AssessmentEvaluationResult;
  studentName?: string;
  onRetake?: () => void;
  onClose?: () => void;
}

export function AssessmentResultCard({
  result,
  studentName,
  onRetake,
  onClose,
}: AssessmentResultCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Badge styling matching the reference screenshot
  const getBadgeStyle = (level: AssessmentLevel) => {
    switch (level) {
      case "beginner":
        return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]";
      case "intermediate":
        return "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]";
      case "advanced":
        return "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]";
      default:
        return "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-[#E7E2D6] overflow-hidden">
      {/* HEADER SECTION: "Your Assessment Result" 🎉 */}
      <div className="pt-8 pb-4 px-6 sm:px-8 text-center bg-gradient-to-b from-[#FBF9F5] to-white border-b border-[#F0EBE1]">
        <div className="text-3xl mb-2 select-none" role="img" aria-label="celebration">
          🎉
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
          Your Assessment Result
        </h2>
        <p className="text-sm font-medium text-[#78716C] mt-1">
          Learn and Grow – English Assessment
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* SCORE CARDS: Two side-by-side cards matching reference */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1: Your Score */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#15803D] tracking-tight">
              {result.score}/{result.totalQuestions}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#6C757D] mt-1.5 uppercase tracking-wider">
              Your Score
            </span>
          </div>

          {/* Card 2: Accuracy */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
              {result.accuracyPercentage}%
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#6C757D] mt-1.5 uppercase tracking-wider">
              Accuracy
            </span>
          </div>
        </div>

        {/* PROFICIENCY BADGE & FEEDBACK */}
        <div className="text-center space-y-3 pt-2">
          {/* Proficiency Badge */}
          <div className="inline-block">
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${getBadgeStyle(
                result.level
              )} shadow-2xs`}
            >
              {result.levelTitle}
            </span>
          </div>

          {/* Feedback Heading */}
          <h3 className="text-2xl sm:text-[26px] font-bold text-[#1C1917] leading-tight">
            {result.feedbackHeading}
          </h3>

          {/* Feedback Message */}
          <p className="text-[#44403C] text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            {result.feedbackMessage}
          </p>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-[#E7E2D6] pt-5">
          {/* RECOMMENDED NEXT STEP */}
          <div className="space-y-2 mb-5">
            <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">
              Recommended next step
            </h4>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              Join our Spoken English Course to improve your grammar, vocabulary and
              speaking confidence.
            </p>
          </div>

          {/* PRIMARY WHATSAPP CTA: Prominent Green Button */}
          <a
            href={result.whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-white bg-[#15803D] hover:bg-[#166534] active:scale-[0.99] transition-all duration-150 shadow-md hover:shadow-lg text-base sm:text-[17px] group"
          >
            <MessageCircle className="w-5 h-5 fill-current shrink-0" />
            <span>{result.recommendedCtaText || "Join Our Spoken English Class"}</span>
          </a>
        </div>

        {/* DETAILED QUESTION BREAKDOWN ACCORDION */}
        {result.breakdown && result.breakdown.length > 0 && (
          <div className="pt-2 border-t border-[#F0EBE1]">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full py-2.5 px-4 bg-[#F5F2EB]/70 hover:bg-[#EFECE4] rounded-xl text-xs sm:text-sm font-semibold text-[#44403C] flex items-center justify-between transition-colors border border-[#E7E2D6]"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                Review All 20 Questions & Answers
              </span>
              {showBreakdown ? (
                <ChevronUp className="w-4 h-4 text-[#78716C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#78716C]" />
              )}
            </button>

            {showBreakdown && (
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
                {result.breakdown.map((item, idx) => (
                  <div
                    key={item.questionId || idx}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm space-y-1.5 ${
                      item.isCorrect
                        ? "bg-[#F0FDF4] border-[#BBF7D0]"
                        : "bg-[#FEF2F2] border-[#FECACA]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[#1C1917]">
                        Q{idx + 1}. {item.questionText}
                      </span>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[#15803D] font-bold shrink-0 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#DC2626] font-bold shrink-0 text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-xs space-y-0.5 text-[#44403C]">
                      <div>
                        <span className="font-medium text-[#78716C]">Your answer: </span>
                        <span
                          className={
                            item.isCorrect
                              ? "font-semibold text-[#15803D]"
                              : "font-semibold text-[#DC2626]"
                          }
                        >
                          {item.selectedAnswer || "(No answer selected)"}
                        </span>
                      </div>
                      {!item.isCorrect && (
                        <div>
                          <span className="font-medium text-[#78716C]">Correct answer: </span>
                          <span className="font-semibold text-[#15803D]">
                            {item.correctAnswer}
                          </span>
                        </div>
                      )}
                      {item.explanation && (
                        <div className="text-[#57534E] text-[11px] pt-1 italic">
                          💡 {item.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FOOTER ACTIONS: Retake & Explore */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-[#78716C]">
          {onRetake && (
            <button
              onClick={onRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#DCD4C4] hover:bg-[#F5F2EB] text-[#44403C] font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[#78716C]" />
              <span>Retake Assessment</span>
            </button>
          )}

          {onClose ? (
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#EFECE4] hover:bg-[#E5E0D5] text-[#1C1917] font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#15803D]" />
              <span>Explore Course Website</span>
            </button>
          ) : (
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#EFECE4] hover:bg-[#E5E0D5] text-[#1C1917] font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#15803D]" />
              <span>Explore Course Website</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
