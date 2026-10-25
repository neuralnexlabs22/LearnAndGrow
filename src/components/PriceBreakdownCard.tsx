"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CoursePricing } from "@/types";
import { getPriceOfferWhatsAppUrl } from "@/lib/config";

interface PriceBreakdownCardProps {
  pricing?: CoursePricing;
  userEmail?: string;
  className?: string;
  showEnrollButton?: boolean;
}

export function PriceBreakdownCard({
  pricing: initialPricing,
  userEmail,
  className = "",
  showEnrollButton = true,
}: PriceBreakdownCardProps) {
  const [pricing, setPricing] = useState<CoursePricing | undefined>(initialPricing);

  // Sync if prop updates
  useEffect(() => {
    if (initialPricing) {
      setPricing(initialPricing);
    }
  }, [initialPricing]);

  // Always fetch latest pricing from /api/pricing to guarantee instant updates
  useEffect(() => {
    let isMounted = true;
    const fetchLatestPricing = () => {
      fetch("/api/pricing", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data && typeof data.sellingPrice === "number") {
            setPricing(data);
          }
        })
        .catch((err) => console.warn("Could not sync latest pricing:", err));
    };

    fetchLatestPricing();

    // Listen for instant in-tab update event from Admin Dashboard
    const handlePricingUpdated = (e: any) => {
      if (e.detail) {
        setPricing(e.detail);
      } else {
        fetchLatestPricing();
      }
    };

    window.addEventListener("pricing-updated", handlePricingUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("pricing-updated", handlePricingUpdated);
    };
  }, []);

  // Safe defaults
  const originalPrice = Number(pricing?.originalPrice) || 1199;
  const sellingPrice = Number(pricing?.sellingPrice) || 999;
  const currency = pricing?.currency || "₹";
  const savings = Math.max(0, originalPrice - sellingPrice);
  const discountPercent =
    pricing?.discountPercent !== undefined && !isNaN(pricing.discountPercent)
      ? pricing.discountPercent
      : originalPrice > 0
      ? Math.round((savings / originalPrice) * 100)
      : 0;
  const offerTag = pricing?.offerTag || "LIMITED TIME OFFER";

  const whatsAppUrl = getPriceOfferWhatsAppUrl(
    originalPrice,
    sellingPrice,
    currency,
    userEmail
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-stone-950 text-white border border-white/10 shadow-2xl p-6 sm:p-8 ${className}`}
    >
      {/* Subtle neon glow effect */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#D4FF00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D4FF00] font-semibold block">
            {offerTag}
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mt-0.5">
            PRICE BREAKDOWN
          </h3>
        </div>
        {savings > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 animate-pulse">
            SAVE {currency}{savings.toLocaleString("en-IN")} ({discountPercent}% OFF)
          </span>
        )}
      </div>

      {/* User's Exact Price Representation */}
      <div className="space-y-2 py-2">
        <div className="text-stone-400 text-lg sm:text-xl font-medium tracking-tight">
          Original:{" "}
          <span className="line-through text-stone-400 ml-1">
            {currency}{originalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Selling:
          </span>
          <span
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ color: "#D4FF00" }}
          >
            {currency}{sellingPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-stone-400 font-medium ml-1">
            (One-time course fee)
          </span>
        </div>
      </div>

      {/* Included Course Highlights */}
      <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5 text-sm text-stone-300">
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#D4FF00] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Full 8-Week Structured Spoken English Curriculum</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#D4FF00] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>8 Comprehensive Weekly PDF Practice Workbooks</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#D4FF00] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Direct WhatsApp Instructor Support & Guidance</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#D4FF00] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Official Learn and Grow Certificate of Completion</span>
        </div>
      </div>

      {/* WhatsApp Action Button */}
      {showEnrollButton && (
        <div className="mt-6 pt-4">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-stone-950 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4FF00]/20"
            style={{ backgroundColor: "#D4FF00" }}
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.584 1.774.88 2.796.88 3.179 0 5.767-2.587 5.767-5.766.001-3.18-2.585-5.767-5.767-5.767zm7.625 5.765c0 4.208-3.424 7.632-7.625 7.632-1.314 0-2.551-.341-3.633-.935l-4.041 1.059 1.08-3.938c-.689-1.144-1.077-2.482-1.077-3.818 0-4.209 3.424-7.633 7.671-7.633 4.207 0 7.625 3.424 7.625 7.633z" />
            </svg>
            <span>Enroll on WhatsApp for {currency}{sellingPrice.toLocaleString("en-IN")}</span>
          </a>
          <p className="text-center text-[11px] text-stone-400 mt-2.5">
            Instant batch enrollment & WhatsApp confirmation • Fast reply
          </p>
        </div>
      )}
    </div>
  );
}
