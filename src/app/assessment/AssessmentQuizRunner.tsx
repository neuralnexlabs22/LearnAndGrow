"use client";

import { useState } from "react";
import { PublicQuestion } from "@/components/AssessmentQuizModal";
import { AssessmentResultCard } from "@/components/AssessmentResultCard";
import { AssessmentEvaluationResult } from "@/types";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface AssessmentQuizRunnerProps {
  initialQuestions: PublicQuestion[];
  initialSettings: {
    title: string;
    subtitle: string;
    description: string;
    instructions: string;
    totalQuestions: number;
  };
}

export function AssessmentQuizRunner({
  initialQuestions,
  initialSettings,
}: AssessmentQuizRunnerProps) {
  const [stage, setStage] = useState<"intro" | "quiz" | "result">("intro");
  const [questions] = useState<PublicQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [result, setResult] = useState<AssessmentEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unansweredHighlight, setUnansweredHighlight] = useState(false);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const unansweredIndices = questions
    .map((q, idx) => ({ id: q.id, index: idx }))
    .filter((item) => !answers[item.id]);

  const allAnswered = questions.length > 0 && unansweredIndices.length === 0;

  const handleSubmit = async () => {
    if (!allAnswered) {
      setUnansweredHighlight(true);
      setShowConfirmModal(false);
      if (unansweredIndices.length > 0) {
        setCurrentIndex(unansweredIndices[0].index);
      }
      return;
    }

    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          studentName: studentName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit assessment.");
      }

      setResult(data.result);
      setStage("result");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while evaluating your assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setStage("quiz");
  };

  if (stage === "result" && result) {
    return (
      <div className="py-4">
        <AssessmentResultCard
          result={result}
          studentName={studentName}
          onRetake={handleRetake}
        />
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-[#E7E2D6] p-6 sm:p-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFECE4] border border-[#DCD4C4] text-xs font-semibold text-[#44403C]">
          <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
          <span>LEARN AND GROW</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
          {initialSettings.title}
        </h1>

        <p className="text-base text-[#57534E] max-w-xl mx-auto leading-relaxed">
          {initialSettings.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left sm:text-center">
          <div className="bg-[#FBF9F5] border border-[#E7E2D6] p-3.5 rounded-xl">
            <span className="text-xs font-bold text-[#15803D] block mb-0.5">20 MCQs</span>
            <span className="text-[11px] text-[#78716C]">Multiple-choice questions</span>
          </div>
          <div className="bg-[#FBF9F5] border border-[#E7E2D6] p-3.5 rounded-xl">
            <span className="text-xs font-bold text-[#0F2D59] block mb-0.5">3 Levels</span>
            <span className="text-[11px] text-[#78716C]">Beginner, Inter., Advanced</span>
          </div>
          <div className="bg-[#FBF9F5] border border-[#E7E2D6] p-3.5 rounded-xl">
            <span className="text-xs font-bold text-[#D97706] block mb-0.5">Instant Results</span>
            <span className="text-[11px] text-[#78716C]">Score & Accuracy Badge</span>
          </div>
          <div className="bg-[#FBF9F5] border border-[#E7E2D6] p-3.5 rounded-xl">
            <span className="text-xs font-bold text-[#15803D] block mb-0.5">100% Free</span>
            <span className="text-[11px] text-[#78716C]">Open to all visitors</span>
          </div>
        </div>

        <div className="max-w-md mx-auto pt-2 text-left">
          <label
            htmlFor="student-name-input-page"
            className="block text-xs font-semibold text-[#57534E] mb-1.5"
          >
            Your Name <span className="font-normal text-[#A8A29E]">(Optional for results)</span>
          </label>
          <input
            id="student-name-input-page"
            type="text"
            placeholder="e.g. Jane Doe"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#DCD4C4] bg-white text-sm text-[#1C1917] focus:outline-hidden focus:ring-2 focus:ring-[#15803D] shadow-2xs placeholder-[#A8A29E]"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={() => setStage("quiz")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-[#15803D] hover:bg-[#166534] transition-all shadow-md text-base"
          >
            <span>Start Free Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent =
    questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-[#E7E2D6] overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 bg-[#FBF9F5] border-b border-[#E7E2D6] space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-bold text-[#1C1917]">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
              currentQ.level === "beginner"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : currentQ.level === "intermediate"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-indigo-50 text-indigo-800 border-indigo-200"
            }`}
          >
            {currentQ.level} Level
          </span>
        </div>

        <div className="w-full bg-[#EFECE4] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#15803D] h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick jump ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 shrink-0 rounded-md text-xs font-semibold transition-all flex items-center justify-center ${
                  isCurrent
                    ? "bg-[#15803D] text-white ring-2 ring-[#15803D]/40 scale-105"
                    : isAnswered
                    ? "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
                    : "bg-white text-[#78716C] border border-[#E7E2D6] hover:bg-[#F5F2EB]"
                }`}
                aria-label={`Jump to question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTION CONTENT */}
      <div className="p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1 text-left">
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] leading-relaxed">
            {currentQ.questionText}
          </h2>
          <p className="text-xs text-[#78716C]">
            Select the single best answer from the 4 options below:
          </p>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = answers[currentQ.id] === opt;
            const optionLetter = String.fromCharCode(65 + optIdx);

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(currentQ.id, opt)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center gap-3.5 ${
                  isSelected
                    ? "bg-[#F0FDF4] border-[#15803D] text-[#166534] shadow-xs font-semibold ring-1 ring-[#15803D]"
                    : "bg-white border-[#E7E2D6] text-[#44403C] hover:border-[#A8A29E] hover:bg-[#FBF9F5]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#15803D] text-white"
                      : "border border-[#A8A29E] text-[#78716C]"
                  }`}
                >
                  {isSelected ? "✓" : optionLetter}
                </div>
                <span className="text-sm sm:text-base leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {unansweredHighlight && !answers[currentQ.id] && (
          <p className="text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            ⚠️ Please answer this question to complete your assessment.
          </p>
        )}
      </div>

      {/* CONTROLS */}
      <div className="px-6 py-4 bg-[#FBF9F5] border-t border-[#E7E2D6] flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCD4C4] text-xs sm:text-sm font-semibold text-[#44403C] hover:bg-[#F5F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-[#78716C] hidden sm:block">
          {answeredCount} of {questions.length} answered
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs sm:text-sm font-semibold text-white transition-colors shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (!allAnswered) {
                setUnansweredHighlight(true);
                if (unansweredIndices.length > 0) {
                  setCurrentIndex(unansweredIndices[0].index);
                }
              } else {
                setShowConfirmModal(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit Assessment</span>
          </button>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#E7E2D6] shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1C1917]">Submit Assessment?</h3>
              <p className="text-xs sm:text-sm text-[#57534E]">
                You have answered all 20 questions! Ready to see your score, percentage accuracy,
                and proficiency level?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DCD4C4] text-xs sm:text-sm font-semibold text-[#44403C] hover:bg-[#F5F2EB]"
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs sm:text-sm font-bold text-white shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <span>Yes, Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
