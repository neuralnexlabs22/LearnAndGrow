"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  MessageCircle,
  Menu,
  X,
  Shield,
  User,
  LogOut,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { UserProfile, SubscriptionStatus } from "@/types";
import { getEnrollmentWhatsAppUrl } from "@/lib/config";

interface NavbarProps {
  currentUser: UserProfile | null;
  subscriptionStatus: SubscriptionStatus | null;
}

export function Navbar({ currentUser, subscriptionStatus }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  const whatsAppUrl = getEnrollmentWhatsAppUrl(currentUser?.email);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E2D6] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group text-decoration-none focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-[#292524] text-[#FAF8F5] flex items-center justify-center font-bold text-lg shadow-sm border border-[#1C1917]/20 group-hover:bg-[#C25E38] transition-colors">
              <BookOpen className="w-5 h-5 text-[#FAF8F5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-[#1C1917] tracking-tight">
                  Modern Web Engineering
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#EFECE4] text-[#57534E] border border-[#DCD4C4]">
                  8 Weeks
                </span>
              </div>
              <p className="text-xs text-[#78716C] hidden sm:block">
                Structured Student Learning Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-[#EFECE4] text-[#1C1917] font-semibold"
                  : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
              }`}
            >
              Home
            </Link>

            <Link
              href="/course"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/course"
                  ? "bg-[#EFECE4] text-[#1C1917] font-semibold"
                  : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
              }`}
            >
              Course Modules
            </Link>

            {currentUser?.role === "admin" && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-[#FEF3C7] text-[#92400E] font-semibold border border-[#FDE68A]"
                    : "text-[#92400E] bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A]/60"
                }`}
              >
                <Shield className="w-4 h-4 text-[#B45309]" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Right Side CTA & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* WhatsApp Enroll Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-sm transition-all hover:shadow active:scale-[0.98]"
              title="Chat with course instructor on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white" />
              <span>WhatsApp Enroll</span>
            </a>

            {/* Auth Buttons / Profile Indicator */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E7E2D6]">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-[#1C1917] max-w-[130px] truncate">
                    {currentUser.name}
                  </span>
                  {currentUser.role === "admin" ? (
                    <span className="text-[10px] font-medium text-[#B45309] flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Administrator
                    </span>
                  ) : subscriptionStatus === "active" ? (
                    <span className="text-[10px] font-medium text-[#15803D] flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Enrolled (Active)
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#B45309] flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> Pending Approval
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E7E2D6]">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#1C1917] hover:bg-[#EFECE4] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#15803D] text-white"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1C1917] bg-[#EFECE4] hover:bg-[#E6E1D7] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E2D6] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-base font-medium ${
                pathname === "/"
                  ? "bg-[#EFECE4] text-[#1C1917] font-semibold"
                  : "text-[#57534E]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/course"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-base font-medium ${
                pathname === "/course"
                  ? "bg-[#EFECE4] text-[#1C1917] font-semibold"
                  : "text-[#57534E]"
              }`}
            >
              Course Modules (8 Weeks)
            </Link>
            {currentUser?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-[#92400E] bg-[#FEF3C7] flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-[#E7E2D6] space-y-3">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#15803D] text-white shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contact via WhatsApp</span>
            </a>

            {currentUser ? (
              <div className="bg-[#F5F2EB] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1C1917]">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-[#78716C]">{currentUser.email}</p>
                  <p className="text-xs font-medium text-[#C25E38] mt-0.5 capitalize">
                    Status: {subscriptionStatus || "pending"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-[#E7E2D6] text-[#1C1917]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-medium border border-[#D4CDBC] bg-white text-[#1C1917]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold bg-[#C25E38] text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
