import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import {
  getCourseWeeks,
  getStudentsWithSubscriptions,
  getDashboardStats,
} from "@/lib/data-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Modern Web Engineering Course",
  description:
    "Secure administration dashboard for managing 8-week course PDF materials, student subscriptions, and access approvals.",
};

export default async function AdminPage() {
  const { user, subscriptionStatus } = await getCurrentSession();

  // Strict server-side verification: Only administrators permitted
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center px-4">
        <div className="bg-white border border-[#D4CDBC] rounded-2xl p-8 max-w-md w-full text-center space-y-4 beige-card-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto border border-[#FECACA]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1C1917]">
            Administrator Access Required
          </h2>
          <p className="text-xs text-[#57534E] leading-relaxed">
            This dashboard is protected. Only verified course administrators
            have permission to manage curriculum files and student
            subscriptions.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#292524] text-white hover:bg-[#1C1917] transition-colors"
            >
              Sign In as Administrator
            </Link>
            <Link
              href="/"
              className="w-full py-2 rounded-xl text-xs font-medium text-[#78716C] hover:text-[#1C1917] flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Course Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [weeks, students, stats] = await Promise.all([
    getCourseWeeks(),
    getStudentsWithSubscriptions(),
    getDashboardStats(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar currentUser={user} subscriptionStatus={subscriptionStatus} />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E7E2D6]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                  Protected Administration
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Course Admin
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight mt-1">
                Course Management & Student Access
              </h1>
            </div>

            <div className="text-xs text-[#78716C]">
              Signed in as: <strong className="text-[#1C1917]">{user.name}</strong> ({user.email})
            </div>
          </div>

          {/* Admin Dashboard Interactive Client */}
          <AdminDashboardClient
            initialWeeks={weeks}
            initialStudents={students}
            initialStats={stats}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
