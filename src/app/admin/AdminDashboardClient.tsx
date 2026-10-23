"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Trash2,
  Edit,
  Eye,
  Search,
  Check,
  X,
  AlertTriangle,
  Shield,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { CourseWeek, StudentWithSubscription, SubscriptionStatus } from "@/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PdfViewerModal } from "@/components/PdfViewerModal";

interface AdminDashboardClientProps {
  initialWeeks: CourseWeek[];
  initialStudents: StudentWithSubscription[];
  initialStats: {
    totalStudents: number;
    activeSubscriptions: number;
    pendingSubscriptions: number;
    totalPdfs: number;
  };
}

export function AdminDashboardClient({
  initialWeeks,
  initialStudents,
  initialStats,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"weeks" | "students">("weeks");
  const [weeks, setWeeks] = useState<CourseWeek[]>(initialWeeks);
  const [students, setStudents] = useState<StudentWithSubscription[]>(initialStudents);
  const [stats, setStats] = useState(initialStats);

  // Search & Filter for Students
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Notifications
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Modals state
  const [editWeekModal, setEditWeekModal] = useState<CourseWeek | null>(null);
  const [isUpdatingWeek, setIsUpdatingWeek] = useState(false);
  const [uploadingWeekNum, setUploadingWeekNum] = useState<number | null>(null);
  const [previewWeek, setPreviewWeek] = useState<CourseWeek | null>(null);

  // Confirmation modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "",
    isDestructive: true,
    onConfirm: () => {},
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const refreshStats = (currentWeeks: CourseWeek[], currentStudents: StudentWithSubscription[]) => {
    setStats({
      totalStudents: currentStudents.length,
      activeSubscriptions: currentStudents.filter((s) => s.subscriptionStatus === "active").length,
      pendingSubscriptions: currentStudents.filter((s) => s.subscriptionStatus === "pending").length,
      totalPdfs: currentWeeks.filter((w) => !!w.pdfStoragePath).length,
    });
  };

  // 1. PDF UPLOAD / REPLACE
  const handlePdfUpload = async (weekNumber: number, file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Invalid file format. Only PDF (.pdf) documents are accepted.", "error");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast("File size exceeds 25MB limit.", "error");
      return;
    }

    setUploadingWeekNum(weekNumber);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/weeks/${weekNumber}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload PDF.");
      }

      const updatedWeeks = weeks.map((w) =>
        w.weekNumber === weekNumber ? data.week : w
      );
      setWeeks(updatedWeeks);
      refreshStats(updatedWeeks, students);
      showToast(`PDF for Week ${weekNumber} successfully uploaded and secured!`);
    } catch (err: any) {
      showToast(err.message || "Failed to upload file.", "error");
    } finally {
      setUploadingWeekNum(null);
    }
  };

  // 2. DELETE PDF WITH CONFIRMATION
  const promptDeletePdf = (week: CourseWeek) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Delete Week ${week.weekNumber} PDF?`,
      description: `Are you sure you want to permanently delete the study guide for "${week.title}"? Students will no longer be able to download it until a new PDF is uploaded.`,
      confirmLabel: "Delete PDF",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/weeks/${week.weekNumber}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          const updatedWeeks = weeks.map((w) =>
            w.weekNumber === week.weekNumber ? data.week : w
          );
          setWeeks(updatedWeeks);
          refreshStats(updatedWeeks, students);
          showToast(`PDF for Week ${week.weekNumber} was deleted.`);
        } catch (err: any) {
          showToast(err.message || "Failed to delete PDF.", "error");
        } finally {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 3. TOGGLE PUBLISH / UNPUBLISH
  const handleTogglePublish = async (week: CourseWeek) => {
    try {
      const res = await fetch(`/api/admin/weeks/${week.weekNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !week.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedWeeks = weeks.map((w) =>
        w.weekNumber === week.weekNumber ? data.week : w
      );
      setWeeks(updatedWeeks);
      showToast(
        `Week ${week.weekNumber} is now ${
          !week.isPublished ? "Published" : "Draft (Hidden)"
        }.`
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update publish state.", "error");
    }
  };

  // 4. UPDATE WEEK TITLE & DESCRIPTION
  const handleSaveWeekDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWeekModal) return;

    setIsUpdatingWeek(true);
    try {
      const res = await fetch(`/api/admin/weeks/${editWeekModal.weekNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editWeekModal.title,
          description: editWeekModal.description,
          learningObjectives: editWeekModal.learningObjectives,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedWeeks = weeks.map((w) =>
        w.weekNumber === editWeekModal.weekNumber ? data.week : w
      );
      setWeeks(updatedWeeks);
      setEditWeekModal(null);
      showToast(`Week ${editWeekModal.weekNumber} details updated successfully.`);
    } catch (err: any) {
      showToast(err.message || "Failed to update week details.", "error");
    } finally {
      setIsUpdatingWeek(false);
    }
  };

  // 5. UPDATE STUDENT SUBSCRIPTION STATUS
  const handleUpdateSubscriptionStatus = async (
    student: StudentWithSubscription,
    newStatus: SubscriptionStatus
  ) => {
    // If revoking, ask for confirmation!
    if (newStatus === "revoked") {
      setConfirmModalConfig({
        isOpen: true,
        title: `Revoke Course Access for ${student.name}?`,
        description: `This will immediately block ${student.name} (${student.email}) from downloading or viewing protected weekly course materials.`,
        confirmLabel: "Revoke Access",
        isDestructive: true,
        onConfirm: async () => {
          await executeSubscriptionStatusChange(student.id, newStatus);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    await executeSubscriptionStatusChange(student.id, newStatus);
  };

  const executeSubscriptionStatusChange = async (
    studentId: string,
    newStatus: SubscriptionStatus
  ) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedStudents = students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              subscriptionStatus: newStatus,
              approvedAt:
                newStatus === "active" ? new Date().toISOString() : undefined,
            }
          : s
      );

      setStudents(updatedStudents);
      refreshStats(weeks, updatedStudents);
      showToast(data.message || `Subscription updated to ${newStatus}.`);
    } catch (err: any) {
      showToast(err.message || "Failed to update subscription.", "error");
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || s.subscriptionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-fade-in ${
            toastMessage.type === "success"
              ? "bg-[#15803D] text-white border-[#166534]"
              : "bg-[#DC2626] text-white border-[#B91C1C]"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* DASHBOARD OVERVIEW STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-[#D4CDBC] p-5 rounded-2xl beige-card-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Registered Students
            </span>
            <span className="text-2xl font-extrabold text-[#1C1917] block mt-1">
              {stats.totalStudents}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F5F2EB] text-[#57534E] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white border border-[#D4CDBC] p-5 rounded-2xl beige-card-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              Active Subscriptions
            </span>
            <span className="text-2xl font-extrabold text-[#15803D] block mt-1">
              {stats.activeSubscriptions}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#15803D] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Subscriptions */}
        <div className="bg-white border border-[#D4CDBC] p-5 rounded-2xl beige-card-shadow flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                Pending Approval
              </span>
              {stats.pendingSubscriptions > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#B45309] animate-ping" />
              )}
            </div>
            <span className="text-2xl font-extrabold text-[#B45309] block mt-1">
              {stats.pendingSubscriptions}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Uploaded PDFs */}
        <div className="bg-white border border-[#D4CDBC] p-5 rounded-2xl beige-card-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
              Uploaded Course PDFs
            </span>
            <span className="text-2xl font-extrabold text-[#C25E38] block mt-1">
              {stats.totalPdfs} / 8
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FBF0EB] text-[#C25E38] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="border-b border-[#D4CDBC] flex items-center gap-6">
        <button
          onClick={() => setActiveTab("weeks")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative ${
            activeTab === "weeks"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Course Modules & PDF Materials (8 Weeks)</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 ${
            activeTab === "students"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Student Subscriptions</span>
          {stats.pendingSubscriptions > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold border border-[#FDE68A]">
              {stats.pendingSubscriptions} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: COURSE WEEKS MANAGEMENT */}
      {activeTab === "weeks" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                Manage 8 Weekly Modules & PDFs
              </h3>
              <p className="text-xs text-[#78716C]">
                Upload, replace, and delete PDF study guides. Protected PDFs are
                stored in private storage.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F2EB] text-[#57534E] border border-[#E7E2D6]">
              Accepted format: PDF only • Max 25MB
            </span>
          </div>

          <div className="bg-white border border-[#D4CDBC] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#E7E2D6]">
            {weeks.map((week) => (
              <div
                key={week.id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 hover:bg-[#FAF8F5] transition-colors"
              >
                {/* Week Information */}
                <div className="space-y-1.5 flex-1 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#292524] text-white">
                      Week {String(week.weekNumber).padStart(2, "0")}
                    </span>

                    {week.pdfStoragePath ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        PDF Uploaded ({week.pdfFilesizeBytes ? `${(week.pdfFilesizeBytes / 1024).toFixed(1)} KB` : ""})
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                        Missing PDF
                      </span>
                    )}

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        week.isPublished
                          ? "bg-[#F5F2EB] text-[#57534E] border-[#DCD4C4]"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {week.isPublished ? "Published" : "Draft (Hidden)"}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#1C1917]">
                    {week.title}
                  </h4>
                  <p className="text-xs text-[#57534E] line-clamp-2">
                    {week.description}
                  </p>

                  {week.pdfFilename && (
                    <p className="text-[11px] text-[#78716C] font-mono">
                      File: {week.pdfFilename}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Preview Button */}
                  {week.pdfStoragePath && (
                    <button
                      onClick={() => setPreviewWeek(week)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#1C1917] border border-[#D4CDBC] transition-colors"
                      title="Preview PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  )}

                  {/* Edit Week Details */}
                  <button
                    onClick={() => setEditWeekModal(week)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#1C1917] border border-[#D4CDBC] transition-colors"
                    title="Edit Week Title & Description"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#57534E]" />
                    <span>Edit Info</span>
                  </button>

                  {/* Toggle Publish */}
                  <button
                    onClick={() => handleTogglePublish(week)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#57534E] border border-[#D4CDBC] transition-colors"
                  >
                    <span>{week.isPublished ? "Unpublish" : "Publish"}</span>
                  </button>

                  {/* Upload / Replace PDF */}
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#292524] hover:bg-[#1C1917] text-[#FAF8F5] transition-colors cursor-pointer shadow-xs">
                    {uploadingWeekNum === week.weekNumber ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {week.pdfStoragePath ? "Replace PDF" : "Upload PDF"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      disabled={uploadingWeekNum !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePdfUpload(week.weekNumber, file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {/* Delete PDF */}
                  {week.pdfStoragePath && (
                    <button
                      onClick={() => promptDeletePdf(week)}
                      className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors"
                      title="Delete uploaded PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT MANAGEMENT */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                Student Enrollment & Subscription Verification
              </h3>
              <p className="text-xs text-[#78716C]">
                Approve verified WhatsApp payments, reject fraudulent requests,
                or revoke access.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: "all", label: "All Students", count: students.length },
              {
                id: "pending",
                label: "Pending Verification",
                count: students.filter((s) => s.subscriptionStatus === "pending").length,
              },
              {
                id: "active",
                label: "Active Enrolled",
                count: students.filter((s) => s.subscriptionStatus === "active").length,
              },
              {
                id: "revoked",
                label: "Revoked",
                count: students.filter((s) => s.subscriptionStatus === "revoked").length,
              },
              {
                id: "rejected",
                label: "Rejected",
                count: students.filter((s) => s.subscriptionStatus === "rejected").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-[#292524] text-white"
                    : "bg-white text-[#57534E] border border-[#D4CDBC] hover:bg-[#F5F2EB]"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Students Table */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F2EB] border-b border-[#E7E2D6] text-[#78716C] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Registered On</th>
                    <th className="py-3.5 px-6">Subscription Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D6]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-[#78716C] font-medium"
                      >
                        No students found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-[#FAF8F5] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EFECE4] text-[#1C1917] font-bold flex items-center justify-center border border-[#DCD4C4]">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#1C1917]">
                              {student.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-[#57534E] font-mono">
                          {student.email}
                        </td>

                        <td className="py-4 px-6 text-[#78716C]">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6">
                          {student.subscriptionStatus === "active" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-semibold border border-[#A7F3D0]">
                              <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                              Active Access
                            </span>
                          )}

                          {student.subscriptionStatus === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] font-semibold border border-[#FDE68A]">
                              <Clock className="w-3 h-3 text-[#D97706]" />
                              Pending Verification
                            </span>
                          )}

                          {student.subscriptionStatus === "revoked" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] font-semibold border border-[#D1D5DB]">
                              <X className="w-3 h-3 text-[#6B7280]" />
                              Revoked
                            </span>
                          )}

                          {student.subscriptionStatus === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#991B1B] font-semibold border border-[#FECACA]">
                              <X className="w-3 h-3 text-[#DC2626]" />
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.subscriptionStatus === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateSubscriptionStatus(
                                      student,
                                      "active"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-xs transition-colors"
                                  title="Verify payment and unlock course access"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  onClick={() =>
                                    handleUpdateSubscriptionStatus(
                                      student,
                                      "rejected"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {student.subscriptionStatus === "active" && (
                              <button
                                onClick={() =>
                                  handleUpdateSubscriptionStatus(
                                    student,
                                    "revoked"
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors"
                                title="Revoke access immediately"
                              >
                                <span>Revoke Access</span>
                              </button>
                            )}

                            {(student.subscriptionStatus === "revoked" ||
                              student.subscriptionStatus === "rejected") && (
                              <button
                                onClick={() =>
                                  handleUpdateSubscriptionStatus(
                                    student,
                                    "active"
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FAF8F5] hover:bg-[#ECFDF5] text-[#065F46] border border-[#D4CDBC] hover:border-[#A7F3D0] transition-colors"
                              >
                                <span>Re-activate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WEEK DETAILS MODAL */}
      {editWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D6]">
              <h3 className="text-base font-bold text-[#1C1917]">
                Edit Week {editWeekModal.weekNumber} Curriculum Details
              </h3>
              <button
                onClick={() => setEditWeekModal(null)}
                className="p-1 rounded text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeekDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  required
                  value={editWeekModal.title}
                  onChange={(e) =>
                    setEditWeekModal({ ...editWeekModal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D4CDBC] bg-white text-sm text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Module Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editWeekModal.description}
                  onChange={(e) =>
                    setEditWeekModal({
                      ...editWeekModal,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D4CDBC] bg-white text-sm text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditWeekModal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#57534E] hover:bg-[#EFECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingWeek}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-xs disabled:opacity-50"
                >
                  {isUpdatingWeek ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() =>
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmLabel={confirmModalConfig.confirmLabel}
        isDestructive={confirmModalConfig.isDestructive}
      />

      {/* PREVIEW PDF MODAL */}
      {previewWeek && (
        <PdfViewerModal
          isOpen={!!previewWeek}
          onClose={() => setPreviewWeek(null)}
          weekNumber={previewWeek.weekNumber}
          title={previewWeek.title}
          pdfFilename={previewWeek.pdfFilename}
        />
      )}
    </div>
  );
}
