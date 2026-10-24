"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { COURSE_CONFIG } from "@/lib/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/course";
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus:outline-none mb-3"
        >
          <div className="w-11 h-11 rounded-xl bg-white border border-[#D4CDBC] p-1 flex items-center justify-center shadow-xs group-hover:border-[#2E7D32] transition-colors shrink-0">
            <img
              src="/logo.png"
              alt="Learn and Grow Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-xl tracking-tight text-[#0F2D59]">
              Learn <span className="text-[#2E7D32]">and</span> Grow
            </div>
            <p className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase">
              LEARN | IMPROVE | ACHIEVE
            </p>
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight">
          Sign In to Your Student Account
        </h2>
        <p className="mt-1 text-xs text-[#78716C]">
          Access protected 8-week English workbooks and practice materials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#D4CDBC] beige-card-shadow space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
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
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C25E38]/20 focus:border-[#C25E38]"
                />
              </div>
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[#78716C] pt-2">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-[#C25E38] hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
