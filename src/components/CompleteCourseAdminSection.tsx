"use client";

import { useState, useCallback } from "react";
import {
  BookOpen,
  FileText,
  FileCode,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Eye,
  Search,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  Upload,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  Save,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  CompleteCourseSettings,
  CompleteCourseResource,
  CompleteCourseResourceType,
  StudentWithCompleteCourseAccess,
  CompleteCourseAccessLog,
} from "@/types";
import { CompleteCourseResourceModal } from "./CompleteCourseResourceModal";

interface CompleteCourseAdminSectionProps {
  initialSettings: CompleteCourseSettings;
  initialResources: CompleteCourseResource[];
  initialStudents: StudentWithCompleteCourseAccess[];
  showToast: (text: string, type?: "success" | "error") => void;
  onConfirmRequest: (config: {
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void>;
  }) => void;
}

export function CompleteCourseAdminSection({
  initialSettings,
  initialResources,
  initialStudents,
  showToast,
  onConfirmRequest,
}: CompleteCourseAdminSectionProps) {
  // Navigation between the two sub-views
  const [subTab, setSubTab] = useState<"resources" | "access">("resources");

  // Settings state
  const [settings, setSettings] = useState<CompleteCourseSettings>(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [titleInput, setTitleInput] = useState(initialSettings.title || "Complete Spoken English Course");
  const [descInput, setDescInput] = useState(initialSettings.description || "");
  const [origPriceInput, setOrigPriceInput] = useState<number>(initialSettings.originalPrice || 14999);
  const [sellPriceInput, setSellPriceInput] = useState<number>(initialSettings.sellingPrice || 4999);
  const [offerTagInput, setOfferTagInput] = useState<string>(initialSettings.offerTag || "COMPLETE MASTERY PACK");

  // Resources state
  const [resources, setResources] = useState<CompleteCourseResource[]>(initialResources);
  const [previewResource, setPreviewResource] = useState<CompleteCourseResource | null>(null);

  // Resource Create / Edit Modal
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CompleteCourseResource | null>(null);
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resType, setResType] = useState<CompleteCourseResourceType>("pdf");
  const [resUrl, setResUrl] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resIsPublished, setResIsPublished] = useState(true);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);

  // Student Access State
  const [students, setStudents] = useState<StudentWithCompleteCourseAccess[]>(initialStudents);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "active" | "revoked" | "none">("all");
  const [isRefreshingStudents, setIsRefreshingStudents] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  // History Modal State
  const [historyModalStudent, setHistoryModalStudent] = useState<StudentWithCompleteCourseAccess | null>(null);
  const [historyLogs, setHistoryLogs] = useState<CompleteCourseAccessLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  /* ---------------- SETTINGS ACTIONS ---------------- */

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showToast("Course title cannot be empty.", "error");
      return;
    }
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/complete-course/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleInput.trim(),
          description: descInput.trim(),
          originalPrice: Number(origPriceInput) || 14999,
          sellingPrice: Number(sellPriceInput) || 4999,
          offerTag: offerTagInput.trim() || "COMPLETE MASTERY PACK",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettings(data.settings);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("complete-course-pricing-updated", { detail: { settings: data.settings } })
        );
      }
      showToast("Complete Course settings & pricing updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update settings.", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  /* ---------------- RESOURCE MODAL ACTIONS ---------------- */

  const openCreateResourceModal = () => {
    setEditingResource(null);
    setResTitle("");
    setResDesc("");
    setResType("pdf");
    setResUrl("");
    setResFile(null);
    setResIsPublished(true);
    setIsResourceModalOpen(true);
  };

  const openEditResourceModal = (resource: CompleteCourseResource) => {
    setEditingResource(resource);
    setResTitle(resource.title);
    setResDesc(resource.description || "");
    setResType(resource.resourceType);
    setResUrl(resource.externalUrl || "");
    setResFile(null);
    setResIsPublished(resource.isPublished);
    setIsResourceModalOpen(true);
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) {
      showToast("Resource title is required.", "error");
      return;
    }

    if (resType === "link" && (!resUrl.trim() || !resUrl.startsWith("http"))) {
      showToast("A valid external link starting with http:// or https:// is required.", "error");
      return;
    }

    if (!editingResource && (resType === "pdf" || resType === "doc") && !resFile) {
      showToast("Please choose a file to upload.", "error");
      return;
    }

    setIsSubmittingResource(true);
    try {
      let fileStoragePath = editingResource?.fileStoragePath || null;
      let fileName = editingResource?.fileName || null;
      let fileSizeBytes = editingResource?.fileSizeBytes || null;

      // Handle file upload if a new file is chosen
      if (resFile) {
        const formData = new FormData();
        formData.append("file", resFile);

        const uploadRes = await fetch("/api/admin/complete-course/resources/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "File upload failed.");

        fileStoragePath = uploadData.fileStoragePath;
        fileName = uploadData.fileName;
        fileSizeBytes = uploadData.fileSizeBytes;
      }

      if (editingResource) {
        // Update
        const patchRes = await fetch(
          `/api/admin/complete-course/resources/${editingResource.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: resTitle.trim(),
              description: resDesc.trim(),
              resourceType: resType,
              externalUrl: resType === "link" ? resUrl.trim() : null,
              fileName,
              fileStoragePath,
              fileSizeBytes,
              isPublished: resIsPublished,
            }),
          }
        );
        const patchData = await patchRes.json();
        if (!patchRes.ok) throw new Error(patchData.error);

        setResources((prev) =>
          prev.map((r) => (r.id === editingResource.id ? patchData.resource : r))
        );
        showToast("Resource updated successfully!");
      } else {
        // Create
        const postRes = await fetch("/api/admin/complete-course/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resTitle.trim(),
            description: resDesc.trim(),
            resourceType: resType,
            externalUrl: resType === "link" ? resUrl.trim() : null,
            fileName,
            fileStoragePath,
            fileSizeBytes,
            isPublished: resIsPublished,
          }),
        });
        const postData = await postRes.json();
        if (!postRes.ok) throw new Error(postData.error);

        setResources((prev) => [...prev, postData.resource]);
        showToast("Resource added to Complete Course!");
      }

      setIsResourceModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to save resource.", "error");
    } finally {
      setIsSubmittingResource(false);
    }
  };

  const handleTogglePublish = async (resource: CompleteCourseResource) => {
    const newStatus = !resource.isPublished;
    try {
      const res = await fetch(`/api/admin/complete-course/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, isPublished: newStatus } : r))
      );
      showToast(
        newStatus
          ? `Resource '${resource.title}' published.`
          : `Resource '${resource.title}' unpublished.`
      );
    } catch (err: any) {
      showToast(err.message || "Failed to toggle resource status.", "error");
    }
  };

  const handleDeleteResource = (resource: CompleteCourseResource) => {
    onConfirmRequest({
      title: `Delete '${resource.title}'?`,
      description: `Are you sure you want to delete this resource from the Complete Course? This action cannot be undone.`,
      confirmLabel: "Delete Resource",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(
            `/api/admin/complete-course/resources/${resource.id}`,
            { method: "DELETE" }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setResources((prev) => prev.filter((r) => r.id !== resource.id));
          showToast(`Resource '${resource.title}' deleted.`, "success");
        } catch (err: any) {
          showToast(err.message || "Failed to delete resource.", "error");
        }
      },
    });
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= resources.length) return;

    const newResources = [...resources];
    const temp = newResources[index];
    newResources[index] = newResources[targetIndex];
    newResources[targetIndex] = temp;

    // Update orderIndex
    newResources.forEach((r, i) => {
      r.orderIndex = i + 1;
    });

    setResources(newResources);

    try {
      const orderedIds = newResources.map((r) => r.id);
      await fetch("/api/admin/complete-course/resources/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.warn("Reorder sync error:", err);
    }
  };

  /* ---------------- STUDENT ACCESS MANAGEMENT ---------------- */

  const fetchAccessStudents = useCallback(async () => {
    setIsRefreshingStudents(true);
    try {
      const res = await fetch("/api/admin/complete-course/access");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to refresh student access list.", "error");
    } finally {
      setIsRefreshingStudents(false);
    }
  }, [showToast]);

  const promptGrantAccess = (student: StudentWithCompleteCourseAccess) => {
    onConfirmRequest({
      title: `Grant Complete Course Access to ${student.name}?`,
      description: `This will grant ${student.name} (${student.email}) independent access to all published Complete Course study materials, PDFs, Word workbooks, and resource links.`,
      confirmLabel: "Grant Complete Access",
      isDestructive: false,
      onConfirm: async () => {
        setUpdatingStudentId(student.id);
        try {
          const res = await fetch(
            `/api/admin/complete-course/access/${student.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "active", notes: "Granted by admin" }),
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setStudents((prev) =>
            prev.map((s) =>
              s.id === student.id
                ? {
                    ...s,
                    completeCourseAccess: "active",
                    completeCourseApprovedAt: new Date().toISOString(),
                  }
                : s
            )
          );
          showToast(`Complete Course access granted to ${student.name}!`, "success");
        } catch (err: any) {
          showToast(err.message || "Failed to grant access.", "error");
        } finally {
          setUpdatingStudentId(null);
        }
      },
    });
  };

  const promptRevokeAccess = (student: StudentWithCompleteCourseAccess) => {
    onConfirmRequest({
      title: `Revoke Complete Course Access for ${student.name}?`,
      description: `This will immediately block ${student.name} (${student.email}) from viewing or downloading any Complete Course study materials on subsequent server requests.`,
      confirmLabel: "Revoke Complete Access",
      isDestructive: true,
      onConfirm: async () => {
        setUpdatingStudentId(student.id);
        try {
          const res = await fetch(
            `/api/admin/complete-course/access/${student.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "revoked", notes: "Revoked by admin" }),
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          setStudents((prev) =>
            prev.map((s) =>
              s.id === student.id
                ? {
                    ...s,
                    completeCourseAccess: "revoked",
                    completeCourseRevokedAt: new Date().toISOString(),
                  }
                : s
            )
          );
          showToast(`Complete Course access revoked for ${student.name}.`, "success");
        } catch (err: any) {
          showToast(err.message || "Failed to revoke access.", "error");
        } finally {
          setUpdatingStudentId(null);
        }
      },
    });
  };

  const openStudentHistory = async (student: StudentWithCompleteCourseAccess) => {
    setHistoryModalStudent(student);
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/complete-course/access/${student.id}/history`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistoryLogs(data.logs || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load access history.", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (studentFilter === "active") return s.completeCourseAccess === "active";
    if (studentFilter === "revoked") return s.completeCourseAccess === "revoked";
    if (studentFilter === "none") return s.completeCourseAccess === "none";
    return true;
  });

  const activeCount = students.filter((s) => s.completeCourseAccess === "active").length;
  const revokedCount = students.filter((s) => s.completeCourseAccess === "revoked").length;
  const bothActiveCount = students.filter(
    (s) => s.completeCourseAccess === "active" && s.eightWeekAccess === "active"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* TOP HEADER & SUB-NAVIGATION TABS */}
      <div className="bg-white border border-[#D4CDBC] rounded-2xl p-6 beige-card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] bg-[#C25E38]/10 px-2.5 py-0.5 rounded-full border border-[#C25E38]/20">
                Independent Curriculum Track
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8E3D7] text-[#44403C]">
                Separate Course Entitlement
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight mt-1">
              Complete Course Management & Access Control
            </h2>
            <p className="text-xs text-[#57534E] mt-1 max-w-2xl leading-relaxed">
              Manage all study materials, PDFs, editable Word workbooks, external links, and grant independent student access separate from the 8-week weekly course.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#F5F2EB] p-1.5 rounded-xl border border-[#D4CDBC]">
            <button
              onClick={() => setSubTab("resources")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                subTab === "resources"
                  ? "bg-white text-[#1C1917] shadow-xs"
                  : "text-[#57534E] hover:text-[#1C1917]"
              }`}
            >
              Resources & Materials ({resources.length})
            </button>
            <button
              onClick={() => setSubTab("access")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === "access"
                  ? "bg-white text-[#1C1917] shadow-xs"
                  : "text-[#57534E] hover:text-[#1C1917]"
              }`}
            >
              <span>Student Access</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#15803D] text-white">
                {activeCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: RESOURCES & COURSE DETAILS */}
      {subTab === "resources" && (
        <div className="space-y-8">
          {/* COURSE DETAILS FORM */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl p-6 beige-card-shadow space-y-4">
            <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C25E38]" />
              <span>Complete Course Configuration</span>
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Course Section Title
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="e.g. Complete Spoken English Course"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Course Description
                  </label>
                  <input
                    type="text"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Brief description shown to students..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                  />
                </div>
              </div>

              {/* Complete Course Pricing Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-[#F0EBE0]">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={origPriceInput}
                    onChange={(e) => setOrigPriceInput(Number(e.target.value))}
                    placeholder="14999"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Selling / Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sellPriceInput}
                    onChange={(e) => setSellPriceInput(Number(e.target.value))}
                    placeholder="4999"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Offer Badge / Tagline
                  </label>
                  <input
                    type="text"
                    value={offerTagInput}
                    onChange={(e) => setOfferTagInput(e.target.value)}
                    placeholder="e.g. COMPLETE MASTERY PACK"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#C25E38] hover:bg-[#A94E2C] text-white transition-colors disabled:opacity-60"
                >
                  {isSavingSettings ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* RESOURCES LIST */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl p-6 beige-card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">
                  Complete Course Resources & Workbooks
                </h3>
                <p className="text-xs text-[#57534E] mt-0.5">
                  PDFs, Word documents (.docx/.doc), and external learning resource links.
                </p>
              </div>

              <button
                onClick={openCreateResourceModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Resource</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#E7E2D6] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E7E2D6] text-[#78716C] font-semibold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">File / Destination</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D6]">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#78716C]">
                        No learning resources added yet. Click &quot;Add New Resource&quot; to upload your first material.
                      </td>
                    </tr>
                  ) : (
                    resources.map((res, index) => {
                      const isPdf = res.resourceType === "pdf";
                      const isDoc = res.resourceType === "doc";
                      const isLink = res.resourceType === "link";

                      return (
                        <tr key={res.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-[#78716C]">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => handleMoveOrder(index, "up")}
                                disabled={index === 0}
                                className="p-0.5 text-[#A8A29E] hover:text-[#1C1917] disabled:opacity-20"
                                title="Move up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <span className="font-bold">{index + 1}</span>
                              <button
                                onClick={() => handleMoveOrder(index, "down")}
                                disabled={index === resources.length - 1}
                                className="p-0.5 text-[#A8A29E] hover:text-[#1C1917] disabled:opacity-20"
                                title="Move down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                isPdf
                                  ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                                  : isDoc
                                  ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                                  : "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
                              }`}
                            >
                              {isPdf && <FileText className="w-3 h-3" />}
                              {isDoc && <FileCode className="w-3 h-3" />}
                              {isLink && <Globe className="w-3 h-3" />}
                              <span>{isPdf ? "PDF" : isDoc ? "Word Doc" : "External Link"}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#1C1917] max-w-xs sm:max-w-md">
                              {res.title}
                            </div>
                            {res.description && (
                              <div className="text-[11px] text-[#57534E] line-clamp-1 mt-0.5">
                                {res.description}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-[11px] text-[#57534E]">
                            {isLink ? (
                              <a
                                href={res.externalUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1D4ED8] hover:underline flex items-center gap-1 truncate max-w-xs"
                              >
                                <span>{res.externalUrl}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <div className="font-mono truncate max-w-xs">
                                {res.fileName || "Uploaded Document"}
                                {res.fileSizeBytes && (
                                  <span className="text-[#A8A29E] ml-1">
                                    ({(res.fileSizeBytes / 1024).toFixed(0)} KB)
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleTogglePublish(res)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                res.isPublished
                                  ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                  : "bg-[#F5F2EB] text-[#78716C] border-[#D4CDBC]"
                              }`}
                            >
                              {res.isPublished ? "Published" : "Draft"}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isLink && (
                                <button
                                  onClick={() => setPreviewResource(res)}
                                  className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB] transition-colors"
                                  title="Preview resource"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => openEditResourceModal(res)}
                                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB] transition-colors"
                                title="Edit resource"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteResource(res)}
                                className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                                title="Delete resource"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STUDENT ACCESS MANAGEMENT */}
      {subTab === "access" && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D4CDBC] rounded-2xl p-4 beige-card-shadow">
              <span className="text-xs text-[#78716C] font-medium">Total Registered Students</span>
              <div className="text-2xl font-black text-[#1C1917] mt-1">{students.length}</div>
            </div>

            <div className="bg-white border border-[#D4CDBC] rounded-2xl p-4 beige-card-shadow">
              <span className="text-xs text-[#065F46] font-medium">Complete Course Active</span>
              <div className="text-2xl font-black text-[#15803D] mt-1">{activeCount}</div>
            </div>

            <div className="bg-white border border-[#D4CDBC] rounded-2xl p-4 beige-card-shadow">
              <span className="text-xs text-[#B45309] font-medium">Both Tracks Active</span>
              <div className="text-2xl font-black text-[#B45309] mt-1">{bothActiveCount}</div>
            </div>

            <div className="bg-white border border-[#D4CDBC] rounded-2xl p-4 beige-card-shadow">
              <span className="text-xs text-[#DC2626] font-medium">Complete Course Revoked</span>
              <div className="text-2xl font-black text-[#DC2626] mt-1">{revokedCount}</div>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl p-5 beige-card-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name or email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#D4CDBC] text-[#1C1917] font-medium focus:outline-hidden"
              >
                <option value="all">All Access Statuses</option>
                <option value="active">Complete Course Active</option>
                <option value="revoked">Complete Course Revoked</option>
                <option value="none">No Complete Access</option>
              </select>

              <button
                onClick={fetchAccessStudents}
                disabled={isRefreshingStudents}
                className="p-2 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5] border border-[#D4CDBC] transition-colors disabled:opacity-50"
                title="Sync student access"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshingStudents ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* STUDENTS ACCESS TABLE */}
          <div className="bg-white border border-[#D4CDBC] rounded-2xl overflow-hidden beige-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E7E2D6] text-[#78716C] font-semibold">
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6 text-center">Regular 8-Week Course</th>
                    <th className="py-3.5 px-6 text-center">Complete Course Access</th>
                    <th className="py-3.5 px-6">Approval Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D6]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#78716C]">
                        No student accounts matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const isCompleteActive = student.completeCourseAccess === "active";
                      const isCompleteRevoked = student.completeCourseAccess === "revoked";
                      const isUpdating = updatingStudentId === student.id;

                      return (
                        <tr key={student.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-[#1C1917]">{student.name}</div>
                            <div className="text-[11px] text-[#78716C] font-mono mt-0.5">
                              {student.email}
                            </div>
                          </td>

                          {/* 8-WEEK COURSE STATUS */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                student.eightWeekAccess === "active"
                                  ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                  : student.eightWeekAccess === "pending"
                                  ? "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                                  : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                              }`}
                            >
                              <span>
                                {student.eightWeekAccess === "active"
                                  ? "8-Week: Active"
                                  : student.eightWeekAccess === "pending"
                                  ? "8-Week: Pending"
                                  : "8-Week: Revoked"}
                              </span>
                            </span>
                          </td>

                          {/* COMPLETE COURSE ACCESS STATUS */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isCompleteActive
                                  ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                  : isCompleteRevoked
                                  ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                                  : "bg-[#F5F2EB] text-[#78716C] border-[#D4CDBC]"
                              }`}
                            >
                              {isCompleteActive && <Check className="w-3 h-3" />}
                              {isCompleteRevoked && <X className="w-3 h-3" />}
                              {!isCompleteActive && !isCompleteRevoked && <Lock className="w-3 h-3" />}
                              <span>
                                {isCompleteActive
                                  ? "Complete: Active"
                                  : isCompleteRevoked
                                  ? "Complete: Revoked"
                                  : "No Access"}
                              </span>
                            </span>
                          </td>

                          {/* APPROVAL DATE */}
                          <td className="py-4 px-6 text-[11px] text-[#57534E] whitespace-nowrap">
                            {student.completeCourseApprovedAt
                              ? new Date(student.completeCourseApprovedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* History Button */}
                              <button
                                onClick={() => openStudentHistory(student)}
                                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB] transition-colors"
                                title="View access audit history"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              {/* Grant / Revoke Access */}
                              {isCompleteActive ? (
                                <button
                                  onClick={() => promptRevokeAccess(student)}
                                  disabled={isUpdating}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Lock className="w-3 h-3" />
                                  )}
                                  <span>Revoke Access</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => promptGrantAccess(student)}
                                  disabled={isUpdating}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white shadow-xs transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Unlock className="w-3 h-3" />
                                  )}
                                  <span>Grant Access</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT RESOURCE MODAL */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D6]">
              <h3 className="text-base font-bold text-[#1C1917]">
                {editingResource ? "Edit Complete Course Resource" : "Add Complete Course Resource"}
              </h3>
              <button
                onClick={() => setIsResourceModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResourceSubmit} className="space-y-4">
              {/* Resource Type */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Resource Content Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResType("pdf")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      resType === "pdf"
                        ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]"
                        : "bg-white text-[#57534E] border-[#D4CDBC]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResType("doc")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      resType === "doc"
                        ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]"
                        : "bg-white text-[#57534E] border-[#D4CDBC]"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Word Doc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResType("link")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      resType === "link"
                        ? "bg-[#F0FDF4] text-[#15803D] border-[#15803D]"
                        : "bg-white text-[#57534E] border-[#D4CDBC]"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>External Link</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. English Grammar Complete Guide"
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">
                  Description / Topic Notes
                </label>
                <textarea
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  rows={2}
                  placeholder="Briefly describe what this material covers..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                />
              </div>

              {/* Document File Upload for PDF / DOC */}
              {(resType === "pdf" || resType === "doc") && (
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Upload {resType === "pdf" ? "PDF Document (.pdf)" : "Word Document (.docx, .doc)"} *
                  </label>
                  <div className="border border-dashed border-[#D4CDBC] rounded-xl p-3 bg-white text-center">
                    <input
                      type="file"
                      accept={resType === "pdf" ? ".pdf" : ".docx,.doc"}
                      onChange={(e) => setResFile(e.target.files?.[0] || null)}
                      className="text-xs text-[#57534E] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5F2EB] file:text-[#1C1917] hover:file:bg-[#EAE5DA]"
                    />
                    {editingResource?.fileName && !resFile && (
                      <p className="text-[11px] text-[#78716C] mt-1.5 font-mono">
                        Current file: {editingResource.fileName} (Leave empty to keep existing)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* External URL for Link Type */}
              {resType === "link" && (
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    External Resource URL (https://) *
                  </label>
                  <input
                    type="url"
                    value={resUrl}
                    onChange={(e) => setResUrl(e.target.value)}
                    placeholder="https://example.com/practice-portal"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D4CDBC] focus:outline-hidden focus:ring-2 focus:ring-[#C25E38]"
                    required
                  />
                </div>
              )}

              {/* Published checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="res-publish-toggle"
                  checked={resIsPublished}
                  onChange={(e) => setResIsPublished(e.target.checked)}
                  className="rounded border-[#D4CDBC] text-[#15803D] focus:ring-[#15803D]"
                />
                <label htmlFor="res-publish-toggle" className="text-xs font-semibold text-[#1C1917]">
                  Publish resource immediately for authorized students
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E2D6]">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57534E] hover:bg-[#F5F2EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResource}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#15803D] hover:bg-[#166534] text-white transition-colors disabled:opacity-60"
                >
                  {isSubmittingResource ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingResource ? "Update Resource" : "Create Resource"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCESS AUDIT HISTORY MODAL */}
      {historyModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D6]">
              <div>
                <h3 className="text-sm font-bold text-[#1C1917]">
                  Complete Course Access History
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  {historyModalStudent.name} ({historyModalStudent.email})
                </p>
              </div>
              <button
                onClick={() => setHistoryModalStudent(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-[#78716C] flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#C25E38]" />
                  <span>Loading audit logs...</span>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#78716C]">
                  No historical access changes recorded yet.
                </div>
              ) : (
                historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-white border border-[#E7E2D6] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          log.action === "granted"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : "bg-[#FEF2F2] text-[#991B1B]"
                        }`}
                      >
                        {log.action === "granted" ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        <span>{log.action === "granted" ? "Access Granted" : "Access Revoked"}</span>
                      </span>
                      <span className="text-[10px] text-[#A8A29E]">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-[11px] text-[#57534E] leading-relaxed pt-0.5">
                        Note: {log.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHistoryModalStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#292524] text-white hover:bg-[#1C1917] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOURCE VIEWER PREVIEW MODAL */}
      <CompleteCourseResourceModal
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
        resource={previewResource}
      />
    </div>
  );
}

