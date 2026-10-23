"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, User, Mail, Lock, ArrowRight, Loader2, MessageCircle, Info } from "lucide-react";
import { COURSE_CONFIG, getEnrollmentWhatsAppUrl } from "@/lib/config";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      window.location.href = "/course";
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.");
      setIsLoading(false);
    }
  };

  const whatsAppUrl = getEnrollmentWhatsAppUrl();

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus:outline-none mb-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#292524] text-[#FAF8F5] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-[#FAF8F5]" />
          </div>
          <span className="font-bold text-xl text-[#1C1917] tracking-tight">
            {COURSE_CONFIG.shortTitle}
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-xs text-[#78716C]">
          Register for the 8-Week English Learning Journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#D4CDBC] beige-card-shadow space-y-6">
          {/* Important Subscription Policy Banner */}
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-[#D97706]" />
              <span>Enrollment & Subscription Process</span>
            </div>
            <p className="leading-relaxed">
              New accounts start with a <strong>Pending</strong> subscription.
              Course workbooks unlock once the course administrator verifies
              your payment through WhatsApp.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C25E38]/20 focus:border-[#C25E38]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C25E38]/20 focus:border-[#C25E38]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5"
              >
                Password (minimum 6 characters)
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C25E38]/20 focus:border-[#C25E38]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-sm transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#78716C]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#C25E38] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
