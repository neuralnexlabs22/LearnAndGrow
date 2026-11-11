"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Star,
  Award,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  CheckCheck,
  Tag,
  DollarSign,
  RefreshCw,
  UserPlus,
  BookOpen,
} from "lucide-react";
import {
  CourseWeek,
  StudentWithSubscription,
  SubscriptionStatus,
  StudentReview,
  CompletionStatus,
  ReviewStatus,
  DashboardStats,
  AssessmentQuestion,
  AssessmentSettings,
  AssessmentSubmission,
  AssessmentStats,
  CoursePricing,
  CompleteCourseSettings,
  CompleteCourseResource,
  StudentWithCompleteCourseAccess,
} from "@/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { AssessmentAdminSection } from "@/components/AssessmentAdminSection";
import { CompleteCourseAdminSection } from "@/components/CompleteCourseAdminSection";
import { PriceBreakdownCard } from "@/components/PriceBreakdownCard";
import { formatDisplayDate } from "@/lib/config";

interface AdminDashboardClientProps {
  initialWeeks: CourseWeek[];
  initialStudents: StudentWithSubscription[];
  initialReviews: StudentReview[];
  initialStats: DashboardStats;
  initialAssessmentQuestions: AssessmentQuestion[];
  initialAssessmentSettings: AssessmentSettings;
  initialAssessmentSubmissions: AssessmentSubmission[];
  initialAssessmentStats: AssessmentStats;
  initialPricing?: CoursePricing;
  initialCompleteCourseSettings?: CompleteCourseSettings;
  initialCompleteCourseResources?: CompleteCourseResource[];
  initialCompleteCourseStudents?: StudentWithCompleteCourseAccess[];
}

export function AdminDashboardClient({
  initialWeeks,
  initialStudents,
  initialReviews,
  initialStats,
  initialAssessmentQuestions,
  initialAssessmentSettings,
  initialAssessmentSubmissions,
  initialAssessmentStats,
  initialPricing,
  initialCompleteCourseSettings,
  initialCompleteCourseResources,
  initialCompleteCourseStudents,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "weeks" | "complete-course" | "students" | "reviews" | "assessment" | "pricing"
  >("weeks");
  const [weeks, setWeeks] = useState<CourseWeek[]>(initialWeeks);
  const [students, setStudents] = useState<StudentWithSubscription[]>(initialStudents);
  const [reviews, setReviews] = useState<StudentReview[]>(initialReviews);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [pricing, setPricing] = useState<CoursePricing>(
    initialPricing || {
      originalPrice: 10500,
      sellingPrice: 3500,
      currency: "₹",
      discountPercent: 67,
      offerTag: "LIMITED TIME OFFER",
      isOfferActive: true,
    }
  );
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [reviewFilter, setReviewFilter] = useState<string>("all");

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
  const [uploadingPhotoStudentId, setUploadingPhotoStudentId] = useState<string | null>(null);

  // Student refresh & direct registration modal
  const [updatingSubscriptionId, setUpdatingSubscriptionId] = useState<string | null>(null);
  const [isRefreshingStudents, setIsRefreshingStudents] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentSubStatus, setNewStudentSubStatus] = useState<SubscriptionStatus>("active");
  const [newStudentCompStatus, setNewStudentCompStatus] = useState<CompletionStatus>("enrolled");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

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

  const recomputeStats = (
    currentWeeks: CourseWeek[],
    currentStudents: StudentWithSubscription[],
    currentReviews: StudentReview[]
  ) => {
    const activeSubs = currentStudents.filter((s) => s.subscriptionStatus === "active").length;
    const inProg = currentStudents.filter((s) => s.completionStatus === "in_progress").length;
    const completed = currentStudents.filter((s) => s.completionStatus === "completed").length;
    const totalPdfs = currentWeeks.filter((w) => !!w.pdfStoragePath).length;

    const pendingRevs = currentReviews.filter((r) => r.status === "pending").length;
    const approvedRevs = currentReviews.filter((r) => r.status === "approved");

    let avgRating = 0;
    if (approvedRevs.length > 0) {
      const sum = approvedRevs.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Math.round((sum / approvedRevs.length) * 10) / 10;
    }

    setStats({
      totalStudents: currentStudents.length,
      activeSubscriptions: activeSubs,
      studentsInProgress: inProg,
      completedStudents: completed,
      pendingReviews: pendingRevs,
      approvedReviews: approvedRevs.length,
      averageRating: avgRating,
      totalPdfs,
    });
  };

  // Sync client state if server props change
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  // Fetch latest students from server
  const fetchStudents = useCallback(async (quiet = false) => {
    if (updatingSubscriptionId) return; // Prevent overwriting while an activation/revocation update is processing
    if (!quiet) setIsRefreshingStudents(true);
    try {
      const res = await fetch("/api/admin/students");
      if (!res.ok) throw new Error("Failed to load students.");
      const data = await res.json();
      if (Array.isArray(data.students)) {
        setStudents(data.students);
        recomputeStats(weeks, data.students, reviews);
        if (!quiet) showToast("Student list refreshed and up to date!");
      }
    } catch (err: any) {
      if (!quiet) showToast(err.message || "Failed to refresh students.", "error");
    } finally {
      if (!quiet) setIsRefreshingStudents(false);
    }
  }, [weeks, reviews]);

  // Auto-refresh when opening students tab or every 10 seconds while active
  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents(true);
      const interval = setInterval(() => {
        fetchStudents(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchStudents]);

  // Handler to directly register a student from the dashboard
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim() || !newStudentPassword) {
      showToast("All fields are required.", "error");
      return;
    }
    setIsSubmittingStudent(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName.trim(),
          email: newStudentEmail.trim(),
          password: newStudentPassword,
          subscriptionStatus: newStudentSubStatus,
          completionStatus: newStudentCompStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student account.");

      if (Array.isArray(data.students)) {
        setStudents(data.students);
        recomputeStats(weeks, data.students, reviews);
      } else {
        await fetchStudents(true);
      }

      setIsAddStudentModalOpen(false);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentPassword("");
      setNewStudentSubStatus("active");
      setNewStudentCompStatus("enrolled");
      showToast(data.message || `Student '${newStudentName}' created successfully!`);
    } catch (err: any) {
      showToast(err.message || "Failed to create student account.", "error");
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  /* ---------------- 1. PDF & WORD DOCUMENT MANAGEMENT ---------------- */

  const handlePdfUpload = async (weekNumber: number, file: File) => {
    const lowerName = file.name.toLowerCase();
    const isAllowed =
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc");

    if (!isAllowed) {
      showToast(
        "Invalid file format. Please upload a PDF (.pdf) or Word (.docx, .doc) document.",
        "error"
      );
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
      if (!res.ok) throw new Error(data.error);

      const updated = weeks.map((w) =>
        w.weekNumber === weekNumber ? data.week : w
      );
      setWeeks(updated);
      recomputeStats(updated, students, reviews);
      const isWord = lowerName.endsWith(".docx") || lowerName.endsWith(".doc");
      showToast(
        `${isWord ? "Word document" : "PDF"} for Week ${weekNumber} (${file.name}) successfully uploaded and secured!`
      );
    } catch (err: any) {
      showToast(err.message || "Failed to upload document.", "error");
    } finally {
      setUploadingWeekNum(null);
    }
  };

  const promptDeletePdf = (week: CourseWeek) => {
    const lowerName = (week.pdfFilename || "").toLowerCase();
    const isWord = lowerName.endsWith(".docx") || lowerName.endsWith(".doc");
    const docTypeLabel = isWord ? "Word Document" : "PDF";

    setConfirmModalConfig({
      isOpen: true,
      title: `Delete Week ${week.weekNumber} ${docTypeLabel}?`,
      description: `Are you sure you want to delete the study workbook for "${week.title}"?`,
      confirmLabel: `Delete ${docTypeLabel}`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/weeks/${week.weekNumber}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          const updated = weeks.map((w) =>
            w.weekNumber === week.weekNumber ? data.week : w
          );
          setWeeks(updated);
          recomputeStats(updated, students, reviews);
          showToast(`${docTypeLabel} for Week ${week.weekNumber} was deleted.`);
        } catch (err: any) {
          showToast(err.message || `Failed to delete ${docTypeLabel}.`, "error");
        } finally {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleTogglePublish = async (week: CourseWeek) => {
    try {
      const res = await fetch(`/api/admin/weeks/${week.weekNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !week.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updated = weeks.map((w) =>
        w.weekNumber === week.weekNumber ? data.week : w
      );
      setWeeks(updated);
      showToast(
        `Week ${week.weekNumber} is now ${
          !week.isPublished ? "Published" : "Draft (Hidden)"
        }.`
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update publish state.", "error");
    }
  };

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

      const updated = weeks.map((w) =>
        w.weekNumber === editWeekModal.weekNumber ? data.week : w
      );
      setWeeks(updated);
      setEditWeekModal(null);
      showToast(`Week ${editWeekModal.weekNumber} details updated successfully.`);
    } catch (err: any) {
      showToast(err.message || "Failed to update week details.", "error");
    } finally {
      setIsUpdatingWeek(false);
    }
  };

  /* ---------------- 2. STUDENT SUBSCRIPTIONS & COMPLETION ---------------- */

  const handleSubscriptionStatus = async (
    student: StudentWithSubscription,
    newStatus: SubscriptionStatus
  ) => {
    if (newStatus === "revoked") {
      setConfirmModalConfig({
        isOpen: true,
        title: `Revoke Course Access for ${student.name}?`,
        description: `This will immediately block ${student.name} from downloading or viewing protected weekly course workbooks.`,
        confirmLabel: "Revoke Access",
        isDestructive: true,
        onConfirm: async () => {
          await executeSubscriptionChange(student.id, newStatus);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    await executeSubscriptionChange(student.id, newStatus);
  };

  const executeSubscriptionChange = async (
    studentId: string,
    newStatus: SubscriptionStatus
  ) => {
    if (updatingSubscriptionId) return;
    setUpdatingSubscriptionId(studentId);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subscription status");

      const confirmedStatus: SubscriptionStatus = data.subscription?.status || newStatus;
      const confirmedApprovedAt = data.subscription?.approvedAt || (newStatus === "active" ? new Date().toISOString() : undefined);

      const updated = students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              subscriptionStatus: confirmedStatus,
              approvedAt: confirmedApprovedAt,
            }
          : s
      );
      setStudents(updated);
      recomputeStats(weeks, updated, reviews);
      showToast(data.message || `Subscription updated to ${newStatus}.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update subscription.", "error");
    } finally {
      setUpdatingSubscriptionId(null);
    }
  };

  const promptDeleteStudent = (student: StudentWithSubscription) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Delete Student Account?`,
      description: `Are you sure you want to permanently delete '${student.name}' (${student.email})? This action will remove their access, records, and progress completely.`,
      confirmLabel: "Delete Account",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/students/${student.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete student account");

          const updated = students.filter((s) => s.id !== student.id);
          setStudents(updated);
          recomputeStats(weeks, updated, reviews);
          showToast(`Student '${student.name}' deleted successfully.`, "success");
        } catch (err: any) {
          showToast(err.message || "Failed to delete student.", "error");
        } finally {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCompletionStatus = async (
    studentId: string,
    newStatus: CompletionStatus
  ) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/completion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updated = students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              completionStatus: newStatus,
              completedAt: newStatus === "completed" ? new Date().toISOString() : null,
            }
          : s
      );
      setStudents(updated);

      // Also update any reviews by this student
      const updatedReviews = reviews.map((r) =>
        r.studentId === studentId
          ? { ...r, isCompletedStudent: newStatus === "completed" }
          : r
      );
      setReviews(updatedReviews);

      recomputeStats(weeks, updated, updatedReviews);
      showToast(data.message || `Course completion status updated to ${newStatus}.`);
    } catch (err: any) {
      showToast(err.message || "Failed to update completion status.", "error");
    }
  };

  const handleStudentPhotoUpload = async (studentId: string, file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Please select a JPG, PNG, or WEBP image.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file exceeds 5MB.", "error");
      return;
    }

    setUploadingPhotoStudentId(studentId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/students/${studentId}/photo`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updated = students.map((s) =>
        s.id === studentId ? { ...s, photoUrl: data.photoUrl } : s
      );
      setStudents(updated);

      // Update reviews
      const updatedReviews = reviews.map((r) =>
        r.studentId === studentId ? { ...r, studentPhotoUrl: data.photoUrl } : r
      );
      setReviews(updatedReviews);

      showToast("Student photo updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to upload photo.", "error");
    } finally {
      setUploadingPhotoStudentId(null);
    }
  };

  const handleRemoveStudentPhoto = async (studentId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/photo`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updated = students.map((s) =>
        s.id === studentId ? { ...s, photoUrl: null } : s
      );
      setStudents(updated);

      const updatedReviews = reviews.map((r) =>
        r.studentId === studentId ? { ...r, studentPhotoUrl: null } : r
      );
      setReviews(updatedReviews);

      showToast("Student photo removed.");
    } catch (err: any) {
      showToast(err.message || "Failed to remove photo.", "error");
    }
  };

  /* ---------------- 3. REVIEWS MODERATION ---------------- */

  const handleReviewStatus = async (reviewId: string, newStatus: ReviewStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updated = reviews.map((r) => (r.id === reviewId ? data.review : r));
      setReviews(updated);
      recomputeStats(weeks, students, updated);
      showToast(`Review marked as ${newStatus}.`);
    } catch (err: any) {
      showToast(err.message || "Failed to update review status.", "error");
    }
  };

  const handleToggleFeatureReview = async (review: StudentReview) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !review.isFeatured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updated = reviews.map((r) => (r.id === review.id ? data.review : r));
      setReviews(updated);
      showToast(
        !review.isFeatured
          ? "Review is now featured on the Home page."
          : "Review removed from featured list."
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update featured state.", "error");
    }
  };

  const promptDeleteReview = (review: StudentReview) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Delete Student Review?",
      description: `Are you sure you want to delete the review by ${review.studentName}? This cannot be undone.`,
      confirmLabel: "Delete Review",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/reviews/${review.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          const updated = reviews.filter((r) => r.id !== review.id);
          setReviews(updated);
          recomputeStats(weeks, students, updated);
          showToast("Review deleted.");
        } catch (err: any) {
          showToast(err.message || "Failed to delete review.", "error");
        } finally {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const router = useRouter();

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPricing(data.pricing);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pricing-updated", { detail: data.pricing })
        );
      }
      router.refresh();
      showToast("Course pricing & fee breakdown updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save pricing.", "error");
    } finally {
      setIsSavingPricing(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (studentFilter === "pending") matchesFilter = s.subscriptionStatus === "pending";
    else if (studentFilter === "active") matchesFilter = s.subscriptionStatus === "active";
    else if (studentFilter === "completed") matchesFilter = s.completionStatus === "completed";
    else if (studentFilter === "in_progress") matchesFilter = s.completionStatus === "in_progress";
    else if (studentFilter === "revoked") matchesFilter = s.subscriptionStatus === "revoked";

    return matchesQuery && matchesFilter;
  });

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === "all") return true;
    return r.status === reviewFilter;
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

      {/* DASHBOARD OVERVIEW STATS (Real Database-Backed) */}
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

        {/* Completed Students (Live Counter Source) */}
        <div className="bg-white border border-[#D4CDBC] p-5 rounded-2xl beige-card-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
              Course Graduates
            </span>
            <span className="text-2xl font-extrabold text-[#C25E38] block mt-1">
              {stats.completedStudents}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FBF0EB] text-[#C25E38] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-[#D4CDBC] p-5 rounded-2xl beige-card-shadow flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                Pending Reviews
              </span>
              {stats.pendingReviews > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#B45309] animate-ping" />
              )}
            </div>
            <span className="text-2xl font-extrabold text-[#B45309] block mt-1">
              {stats.pendingReviews}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="border-b border-[#D4CDBC] flex items-center gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("weeks")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative shrink-0 ${
            activeTab === "weeks"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Course Modules & PDF Materials (8 Weeks)</span>
        </button>

        <button
          onClick={() => setActiveTab("complete-course")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative shrink-0 flex items-center gap-2 ${
            activeTab === "complete-course"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#C25E38]" />
          <span>Complete Course Management</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-[#C25E38] font-bold border border-orange-200">
            Separate
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("students");
            fetchStudents(true);
          }}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative shrink-0 flex items-center gap-2 ${
            activeTab === "students"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Students & Completion Tracking</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFECE4] text-[#1C1917] font-bold border border-[#DCD4C4]">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative shrink-0 flex items-center gap-2 ${
            activeTab === "reviews"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Reviews Management</span>
          {stats.pendingReviews > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold border border-[#FDE68A]">
              {stats.pendingReviews} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("assessment")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative shrink-0 flex items-center gap-2 ${
            activeTab === "assessment"
              ? "text-[#15803D] border-b-2 border-[#15803D]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#15803D]" />
          <span>English Assessment</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] font-bold border border-emerald-200">
            {initialAssessmentQuestions.length} Qs
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative shrink-0 flex items-center gap-2 ${
            activeTab === "pricing"
              ? "text-[#C25E38] border-b-2 border-[#C25E38]"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <Tag className="w-4 h-4 text-[#C25E38]" />
          <span>Course Fee & Pricing</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#92400E] font-bold border border-amber-200">
            {pricing.currency}{pricing.sellingPrice}
          </span>
        </button>
      </div>

      {/* TAB 1: COURSE WEEKS MANAGEMENT */}
      {activeTab === "weeks" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                Manage 8 Weekly English Modules & Workbooks
              </h3>
              <p className="text-xs text-[#78716C]">
                Upload, replace, and delete PDF or Word (.docx, .doc) study guides. Protected documents are
                stored in private storage.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F2EB] text-[#57534E] border border-[#E7E2D6]">
              Accepted formats: PDF & Word (.docx, .doc) • Max 25MB
            </span>
          </div>

          <div className="bg-white border border-[#D4CDBC] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#E7E2D6]">
            {weeks.map((week) => {
              const lowerFilename = (week.pdfFilename || "").toLowerCase();
              const isWordDoc =
                lowerFilename.endsWith(".docx") || lowerFilename.endsWith(".doc");

              return (
                <div
                  key={week.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="space-y-1.5 flex-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#292524] text-white">
                        Week {String(week.weekNumber).padStart(2, "0")}
                      </span>

                      {week.pdfStoragePath ? (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            isWordDoc
                              ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                              : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          {isWordDoc ? "Word Document" : "PDF"} Uploaded (
                          {week.pdfFilesizeBytes
                            ? `${(week.pdfFilesizeBytes / 1024).toFixed(1)} KB`
                            : ""}
                          )
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                          Missing Document
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

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {week.pdfStoragePath && (
                      <button
                        onClick={() => setPreviewWeek(week)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#1C1917] border border-[#D4CDBC] transition-colors"
                        title={isWordDoc ? "View / Download Word Document" : "Preview PDF"}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isWordDoc ? "View Document" : "Preview"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setEditWeekModal(week)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#1C1917] border border-[#D4CDBC] transition-colors"
                      title="Edit Week Title & Description"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#57534E]" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      onClick={() => handleTogglePublish(week)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#57534E] border border-[#D4CDBC] transition-colors"
                    >
                      <span>{week.isPublished ? "Unpublish" : "Publish"}</span>
                    </button>

                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#292524] hover:bg-[#1C1917] text-[#FAF8F5] transition-colors cursor-pointer shadow-xs">
                      {uploadingWeekNum === week.weekNumber ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {week.pdfStoragePath
                          ? isWordDoc
                            ? "Replace Word Doc"
                            : "Replace PDF"
                          : "Upload Document"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        disabled={uploadingWeekNum !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePdfUpload(week.weekNumber, file);
                          e.target.value = "";
                        }}
                      />
                    </label>

                    {week.pdfStoragePath && (
                      <button
                        onClick={() => promptDeletePdf(week)}
                        className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors"
                        title="Delete uploaded study material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: COMPLETE COURSE MANAGEMENT & ACCESS CONTROL */}
      {activeTab === "complete-course" && (
        <CompleteCourseAdminSection
          initialSettings={
            initialCompleteCourseSettings || {
              id: "default",
              title: "Complete Course",
              description:
                "Get access to the complete English learning course, including all learning materials and additional resources provided by Learn and Grow.",
              coverImageUrl: "/complete-course-cover.png",
              isPublished: true,
              updatedAt: new Date().toISOString(),
            }
          }
          initialResources={initialCompleteCourseResources || []}
          initialStudents={initialCompleteCourseStudents || []}
          showToast={showToast}
          onConfirmRequest={(config) =>
            setConfirmModalConfig({
              isOpen: true,
              title: config.title,
              description: config.description,
              confirmLabel: config.confirmLabel,
              isDestructive: config.isDestructive,
              onConfirm: async () => {
                await config.onConfirm();
                setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
              },
            })
          }
        />
      )}

      {/* TAB 2: STUDENT MANAGEMENT & COMPLETION TRACKING */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1C1917]">
                  Students, Photos & Course Completion Verification
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">
                Manage student profile photos, subscriptions, and verify course completion milestones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchStudents(false)}
                disabled={isRefreshingStudents}
                title="Refresh student list"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F2EB] text-[#57534E] border border-[#D4CDBC] shadow-2xs transition-colors disabled:opacity-60 shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#57534E] ${
                    isRefreshingStudents ? "animate-spin" : ""
                  }`}
                />
                <span>{isRefreshingStudents ? "Syncing..." : "Sync List"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-2xs transition-colors shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Student</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: "all", label: "All Students", count: students.length },
              {
                id: "completed",
                label: "Course Completed",
                count: students.filter((s) => s.completionStatus === "completed").length,
              },
              {
                id: "in_progress",
                label: "In Progress",
                count: students.filter((s) => s.completionStatus === "in_progress").length,
              },
              {
                id: "active",
                label: "Active Enrolled",
                count: students.filter((s) => s.subscriptionStatus === "active").length,
              },
              {
                id: "pending",
                label: "Pending Verification",
                count: students.filter((s) => s.subscriptionStatus === "pending").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                  studentFilter === tab.id
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

          {/* Student Table */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F2EB] border-b border-[#E7E2D6] text-[#78716C] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-6">Student & Photo</th>
                    <th className="py-3.5 px-6">Subscription Status</th>
                    <th className="py-3.5 px-6">Course Completion Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D6]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#78716C] font-medium">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {/* Student Name & Photo */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative group shrink-0">
                              <img
                                src={`/api/students/${student.id}/photo`}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#DCD4C4] bg-[#FAF8F5]"
                              />
                              <label
                                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                                title="Change Student Photo"
                              >
                                {uploadingPhotoStudentId === student.id ? (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                  <Camera className="w-4 h-4 text-white" />
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleStudentPhotoUpload(student.id, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#1C1917]">
                                  {student.name}
                                </span>
                                {student.completionStatus === "completed" && (
                                  <span title="Verified Graduate">
                                    <Award className="w-3.5 h-3.5 text-[#059669]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[#78716C] font-mono block text-[11px]">
                                {student.email}
                              </span>
                              {student.photoUrl && (
                                <button
                                  onClick={() => handleRemoveStudentPhoto(student.id)}
                                  className="text-[10px] text-[#DC2626] hover:text-[#991B1B] mt-0.5 block"
                                >
                                  Remove photo
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Subscription Status */}
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
                              Pending Approval
                            </span>
                          )}

                          {student.subscriptionStatus === "revoked" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] font-semibold border border-[#D1D5DB]">
                              <X className="w-3 h-3 text-[#6B7280]" />
                              Revoked
                            </span>
                          )}
                        </td>

                        {/* Course Completion Status Dropdown / Indicator */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <select
                              value={student.completionStatus || "enrolled"}
                              onChange={(e) =>
                                handleCompletionStatus(
                                  student.id,
                                  e.target.value as CompletionStatus
                                )
                              }
                              className="px-2.5 py-1 rounded-lg border border-[#D4CDBC] bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                            >
                              <option value="enrolled">Enrolled</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed (Graduate)</option>
                              <option value="revoked">Revoked</option>
                            </select>

                            {student.completionStatus === "completed" && student.completedAt && (
                              <span className="text-[10px] text-[#059669] font-medium block" suppressHydrationWarning>
                                Verified: {formatDisplayDate(student.completedAt)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.subscriptionStatus === "pending" && (
                              <button
                                onClick={() => handleSubscriptionStatus(student, "active")}
                                disabled={updatingSubscriptionId === student.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-xs transition-colors disabled:opacity-50"
                              >
                                {updatingSubscriptionId === student.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>{updatingSubscriptionId === student.id ? "Updating..." : "Approve"}</span>
                              </button>
                            )}

                            {student.subscriptionStatus === "active" && (
                              <button
                                onClick={() => handleSubscriptionStatus(student, "revoked")}
                                disabled={updatingSubscriptionId === student.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors disabled:opacity-50"
                              >
                                {updatingSubscriptionId === student.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : null}
                                <span>{updatingSubscriptionId === student.id ? "Updating..." : "Revoke Access"}</span>
                              </button>
                            )}

                            {student.subscriptionStatus === "revoked" && (
                              <button
                                onClick={() => handleSubscriptionStatus(student, "active")}
                                disabled={updatingSubscriptionId === student.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-xs transition-colors disabled:opacity-50"
                              >
                                {updatingSubscriptionId === student.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>{updatingSubscriptionId === student.id ? "Updating..." : "Re-activate Access"}</span>
                              </button>
                            )}

                            {/* Delete Student Button */}
                            <button
                              onClick={() => promptDeleteStudent(student)}
                              title={`Delete student ${student.name}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
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

      {/* TAB 3: REVIEWS MANAGEMENT */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                Student Reviews & Moderation
              </h3>
              <p className="text-xs text-[#78716C]">
                Approve submitted ratings, feature testimonials on the Home page, or remove inappropriate feedback.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: "All Reviews" },
                { id: "pending", label: "Pending Moderation" },
                { id: "approved", label: "Approved Public" },
                { id: "rejected", label: "Rejected" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReviewFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    reviewFilter === tab.id
                      ? "bg-[#292524] text-white"
                      : "bg-white text-[#57534E] border border-[#D4CDBC]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#E7E2D6]">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center text-[#78716C] text-xs font-medium">
                No reviews found under the selected filter.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={`/api/students/${rev.studentId}/photo`}
                        alt={rev.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-[#DCD4C4]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1C1917]">
                            {rev.studentName}
                          </h4>
                          <span className="text-[11px] text-[#78716C]">
                            ({rev.studentEmail})
                          </span>
                          {rev.isCompletedStudent && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                              Graduate
                            </span>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 text-[#B45309]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? "fill-[#B45309] text-[#B45309]"
                                  : "text-[#D4CDBC]"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-[#1C1917] ml-1">
                            {rev.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed italic bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2D6]">
                      &ldquo;{rev.feedback}&rdquo;
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                      <span suppressHydrationWarning>
                        Submitted: {formatDisplayDate(rev.createdAt)}
                      </span>
                      <span>•</span>
                      <span
                        className={`font-semibold capitalize px-2 py-0.5 rounded ${
                          rev.status === "approved"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : rev.status === "pending"
                            ? "bg-[#FFFBEB] text-[#92400E]"
                            : "bg-[#FEF2F2] text-[#991B1B]"
                        }`}
                      >
                        Status: {rev.status}
                      </span>
                      {rev.isFeatured && (
                        <span className="bg-[#FEF3C7] text-[#92400E] font-semibold px-2 py-0.5 rounded flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Featured on Home
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {rev.status !== "approved" && (
                      <button
                        onClick={() => handleReviewStatus(rev.id, "approved")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== "rejected" && (
                      <button
                        onClick={() => handleReviewStatus(rev.id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleFeatureReview(rev)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#57534E] border border-[#D4CDBC] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>{rev.isFeatured ? "Unfeature" : "Feature on Home"}</span>
                    </button>

                    <button
                      onClick={() => promptDeleteReview(rev)}
                      className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors"
                      title="Permanently Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ENGLISH ASSESSMENT MANAGEMENT */}
      {activeTab === "assessment" && (
        <AssessmentAdminSection
          initialQuestions={initialAssessmentQuestions}
          initialSettings={initialAssessmentSettings}
          initialSubmissions={initialAssessmentSubmissions}
          initialStats={initialAssessmentStats}
          showToast={showToast}
        />
      )}

      {/* TAB 5: COURSE PRICING & FEE BREAKDOWN MANAGEMENT */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#E7E2D6]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
                  Commercial Settings
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Live Dynamic Fee
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight mt-1">
                Course Fees & Price Breakdown Management
              </h3>
              <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
                Set and update the original fee, discounted selling fee, and promo badge. Changes apply instantly across the course page and WhatsApp enrollment links.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* PRICING FORM */}
            <div className="lg:col-span-7 bg-white border border-[#D4CDBC] rounded-2xl p-6 sm:p-8 space-y-6 beige-card-shadow">
              <form onSubmit={handleSavePricing} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Original Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                      Original Strikethrough Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#78716C]">
                        {pricing.currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={pricing.originalPrice}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const sell = pricing.sellingPrice;
                          const discount =
                            orig > 0
                              ? Math.max(0, Math.round(((orig - sell) / orig) * 100))
                              : 0;
                          setPricing({
                            ...pricing,
                            originalPrice: orig,
                            discountPercent: discount,
                          });
                        }}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-base font-bold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C25E38]"
                        placeholder="1199"
                      />
                    </div>
                    <p className="text-[11px] text-[#78716C] mt-1">
                      Displayed crossed out (e.g. Original: ₹1,199)
                    </p>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#15803D] mb-1.5">
                      Selling Price (Active Fee)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#15803D]">
                        {pricing.currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={pricing.sellingPrice}
                        onChange={(e) => {
                          const sell = Number(e.target.value);
                          const orig = pricing.originalPrice;
                          const discount =
                            orig > 0
                              ? Math.max(0, Math.round(((orig - sell) / orig) * 100))
                              : 0;
                          setPricing({
                            ...pricing,
                            sellingPrice: sell,
                            discountPercent: discount,
                          });
                        }}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#A7F3D0] bg-[#F0FDF4] text-base font-extrabold text-[#15803D] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                        placeholder="999"
                      />
                    </div>
                    <p className="text-[11px] text-[#15803D] mt-1">
                      Prominently highlighted in bright neon lime (e.g. Selling: ₹999)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Currency Symbol */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      required
                      value={pricing.currency}
                      onChange={(e) =>
                        setPricing({ ...pricing, currency: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-sm font-semibold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C25E38]"
                      placeholder="₹"
                    />
                  </div>

                  {/* Offer Tag */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                      Offer Badge / Tagline
                    </label>
                    <input
                      type="text"
                      value={pricing.offerTag || ""}
                      onChange={(e) =>
                        setPricing({ ...pricing, offerTag: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D4CDBC] bg-[#FAF8F5] text-sm font-semibold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C25E38]"
                      placeholder="LIMITED TIME OFFER"
                    />
                  </div>
                </div>

                {/* Offer Active Switch */}
                <div className="p-4 rounded-xl bg-[#F5F2EB] border border-[#E7E2D6] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#1C1917] block">
                      Promotional Discount Active
                    </span>
                    <span className="text-xs text-[#78716C]">
                      Toggle whether to display the discount savings badge and strikethrough price.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.isOfferActive}
                      onChange={(e) =>
                        setPricing({ ...pricing, isOfferActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#D4CDBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15803D]" />
                  </label>
                </div>

                {/* Computed Savings Overview */}
                {(() => {
                  const orig = Number(pricing.originalPrice) || 0;
                  const sell = Number(pricing.sellingPrice) || 0;
                  const savings = Math.max(0, orig - sell);
                  const discount =
                    orig > 0 ? Math.round((savings / orig) * 100) : 0;
                  return (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#92400E] block">
                          Calculated Savings
                        </span>
                        <span className="text-[#B45309]">
                          Students save {pricing.currency || "₹"}
                          {savings.toLocaleString("en-IN")} per enrollment
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-200 text-[#78350F] font-extrabold text-xs">
                        {discount}% OFF
                      </span>
                    </div>
                  );
                })()}

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPricing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-sm transition-all hover:shadow disabled:opacity-50"
                  >
                    {isSavingPricing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Pricing Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* LIVE PREVIEW OF CARD */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Live Student View Preview
                </span>
                <span className="text-[11px] font-semibold text-[#15803D] bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Matches Course Page
                </span>
              </div>
              <PriceBreakdownCard pricing={pricing} showEnrollButton={false} />
              <div className="p-4 rounded-xl bg-white border border-[#E7E2D6] text-xs text-[#78716C] space-y-1">
                <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Instant Public Sync</span>
                </div>
                <p>
                  Saving here updates the fee cards immediately on the course page and pre-fills WhatsApp enrollment messages with <strong>{pricing.currency}{pricing.sellingPrice}</strong>.
                </p>
              </div>
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

      {/* REGISTER / ADD STUDENT MODAL */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C25E38]/10 text-[#C25E38] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">
                    Register New Student
                  </h3>
                  <p className="text-[11px] text-[#78716C]">
                    Create a verified student account directly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1 rounded text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  Temporary / Initial Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Subscription
                  </label>
                  <select
                    value={newStudentSubStatus}
                    onChange={(e) =>
                      setNewStudentSubStatus(e.target.value as SubscriptionStatus)
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                  >
                    <option value="active">Active (Approved)</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Course Status
                  </label>
                  <select
                    value={newStudentCompStatus}
                    onChange={(e) =>
                      setNewStudentCompStatus(e.target.value as CompletionStatus)
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#D4CDBC] bg-white text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E2D6]">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#57534E] hover:bg-[#EFECE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-xs disabled:opacity-50"
                >
                  {isSubmittingStudent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
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
