"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CompleteCourseSettings } from "@/types";
import { getCompleteCoursePriceOfferWhatsAppUrl } from "@/lib/config";
import { Sparkles, MessageCircle, CheckCircle2, ShieldCheck, ArrowRight, BookOpen, Layers } from "lucide-react";

interface CompleteCoursePriceCardProps {
  settings?: CompleteCourseSettings;
  userEmail?: string;
  className?: string;
  showEnrollButton?: boolean;
}

export function CompleteCoursePriceCard({
  settings: initialSettings,
  userEmail,
  className = "",
  showEnrollButton = true,
}: CompleteCoursePriceCardProps) {
  const [settings, setSettings] = useState<CompleteCourseSettings | undefined>(initialSettings);

  // Sync if prop updates
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  // Fetch latest settings from /api/complete-course for instant public sync
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = () => {
      fetch("/api/complete-course", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data?.settings && typeof data.settings.sellingPrice === "number") {
            setSettings(data.settings);
          }
        })
        .catch((err) => console.warn("Could not sync complete course pricing:", err));
    };

    fetchLatest();

    const handleUpdated = (e: any) => {
      if (e.detail?.settings) {
        setSettings(e.detail.settings);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener("complete-course-pricing-updated", handleUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("complete-course-pricing-updated", handleUpdated);
    };
  }, []);

  const originalPrice = Number(settings?.originalPrice) || 14999;
  const sellingPrice = Number(settings?.sellingPrice) || 4999;
  const currency = settings?.currency || "₹";
  const savings = Math.max(0, originalPrice - sellingPrice);
  const discountPercent =
    settings?.discountPercent !== undefined && !isNaN(settings.discountPercent)
      ? settings.discountPercent
      : originalPrice > 0
      ? Math.round((savings / originalPrice) * 100)
      : 0;
  const offerTag = settings?.offerTag || "ALL-IN-ONE COMPLETE PACK";
  const courseTitle = settings?.title || "Complete Spoken English Course";

  const whatsAppUrl = getCompleteCoursePriceOfferWhatsAppUrl(
    originalPrice,
    sellingPrice,
    currency,
    userEmail
  );

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 text-white border-2 border-amber-500/30 shadow-2xl p-6 sm:p-8 flex flex-col justify-between ${className}`}
    >
      {/* Decorative radial glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#C25E38]/15 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Top Header Badge & Tag */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{offerTag}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mt-1.5">
              {courseTitle}
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              Independent Full-Access Track
            </p>
          </div>
          {savings > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-sm animate-pulse">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Pricing Block */}
        <div className="space-y-3 mb-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {currency}{sellingPrice.toLocaleString("en-IN")}
            </span>
            {originalPrice > sellingPrice && (
              <span className="text-xl sm:text-2xl font-bold text-stone-400 line-through">
                {currency}{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {savings > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>You save {currency}{savings.toLocaleString("en-IN")} instantly</span>
            </div>
          )}

          <p className="text-xs text-stone-300">
            One-time enrollment fee • Lifetime complete access • No monthly renewal
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 border-t border-white/10 pt-5 mb-6 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5 text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>All Comprehensive PDF Handbooks</strong> (Complete English Grammar Guide)</span>
          </div>
          <div className="flex items-start gap-2.5 text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Microsoft Word Practice Drills (.docx)</strong> for active self-study</span>
          </div>
          <div className="flex items-start gap-2.5 text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Audio & Video Pronunciation Portal</strong> access included</span>
          </div>
          <div className="flex items-start gap-2.5 text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Independent Access</strong>: Study at your own pace anytime</span>
          </div>
          <div className="flex items-start gap-2.5 text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Direct WhatsApp Mentor Guidance</strong> for enrollment & materials support</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Enrollment CTA */}
      {showEnrollButton && (
        <div className="pt-2">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] text-center"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Enroll in Complete Course via WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-[11px] text-center text-stone-400 mt-2">
            Clicking opens WhatsApp with pre-filled course fee inquiry ({currency}{sellingPrice})
          </p>
        </div>
      )}
    </div>
  );
}

