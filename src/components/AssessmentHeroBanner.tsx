"use client";

import { Sparkles, ArrowRight, Award, CheckCircle2, Clock } from "lucide-react";
import { openFreeAssessment } from "./AssessmentFirstVisitOverlay";
import Link from "next/link";

export function AssessmentHeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2D59] via-[#163B70] to-[#0A1F3D] text-white p-6 sm:p-8 shadow-xl border border-[#234B80] my-8">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FREE ENGLISH GRAMMAR ASSESSMENT</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Discover Your English Grammar Level
          </h2>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
            Take our free 20-question assessment, discover your current English grammar level, and identify the areas you can improve.
          </p>

          <p className="text-xs sm:text-sm text-stone-300">
            The assessment is 100% free and thoughtfully covers <span className="text-emerald-300 font-semibold">Beginner</span>, <span className="text-sky-300 font-semibold">Intermediate</span>, and <span className="text-amber-300 font-semibold">Advanced</span> grammar questions to accurately diagnose your communication foundation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              20 Curated Questions
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Score, Percentage & Badge
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              WhatsApp Result Sharing
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <button
            onClick={() => openFreeAssessment(false)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[#0F2D59] bg-white hover:bg-[#F5F2EB] active:scale-95 transition-all shadow-md text-sm sm:text-base cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#15803D]" />
            <span>Take Free Assessment</span>
            <ArrowRight className="w-4 h-4 text-[#15803D]" />
          </button>

          <Link
            href="/assessment"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors border border-white/20 text-center"
          >
            Open Full Screen Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
