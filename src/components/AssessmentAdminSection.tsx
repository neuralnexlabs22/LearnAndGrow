"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  Settings,
  BarChart3,
  ListFilter,
  Award,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  AssessmentQuestion,
  AssessmentSettings,
  AssessmentSubmission,
  AssessmentStats,
  AssessmentLevel,
} from "@/types";
import { ConfirmModal } from "./ConfirmModal";
import { AssessmentQuizModal } from "./AssessmentQuizModal";
import { formatDisplayDate } from "@/lib/config";

interface AssessmentAdminSectionProps {
  initialQuestions: AssessmentQuestion[];
  initialSettings: AssessmentSettings;
  initialSubmissions: AssessmentSubmission[];
  initialStats: AssessmentStats;
  showToast: (text: string, type?: "success" | "error") => void;
}

export function AssessmentAdminSection({
  initialQuestions,
  initialSettings,
  initialSubmissions,
  initialStats,
  showToast,
}: AssessmentAdminSectionProps) {
  const [subTab, setSubTab] = useState<"questions" | "settings" | "submissions">("questions");

  // Questions state
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Settings state
  const [settings, setSettings] = useState<AssessmentSettings>(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Submissions & Analytics state
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>(initialSubmissions);
  const [stats, setStats] = useState<AssessmentStats>(initialStats);
  const [selectedSubmission, setSelectedSubmission] = useState<AssessmentSubmission | null>(null);

  // Edit/Add Question Modal state
  const [editingQuestion, setEditingQuestion] = useState<Partial<AssessmentQuestion> | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Student preview modal state
  const [previewStudentModal, setPreviewStudentModal] = useState(false);

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = levelFilter === "all" || q.level === levelFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && q.isActive) ||
      (statusFilter === "inactive" && !q.isActive);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Reorder question up/down
  const handleMoveQuestion = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((q) => q.id);
    setQuestions(reordered.map((q, idx) => ({ ...q, orderIndex: idx + 1 })));

    try {
      const res = await fetch("/api/admin/assessment/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to update question order.");
      showToast("Question order updated successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to update question order.", "error");
    }
  };

  // Toggle question active status
  const handleToggleActive = async (question: AssessmentQuestion) => {
    const newStatus = !question.isActive;
    const updatedList = questions.map((q) =>
      q.id === question.id ? { ...q, isActive: newStatus } : q
    );
    setQuestions(updatedList);

    try {
      const res = await fetch(`/api/admin/assessment/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...question, isActive: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update question status.");
      showToast(
        newStatus
          ? `Question ${question.orderIndex} enabled.`
          : `Question ${question.orderIndex} disabled.`
      );
    } catch (err: any) {
      showToast(err.message || "Failed to toggle status.", "error");
    }
  };

  // Delete question handler
  const handleDeleteQuestion = (question: AssessmentQuestion) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete Question ${question.orderIndex}?`,
      description: `Are you sure you want to delete this ${question.level} level question? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/assessment/questions/${question.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete question.");

          setQuestions((prev) => prev.filter((q) => q.id !== question.id));
          showToast("Assessment question deleted successfully.");
        } catch (err: any) {
          showToast(err.message || "Failed to delete question.", "error");
        }
      },
    });
  };

  // Save/Create question
  const handleSaveQuestionSubmit = async () => {
    if (!editingQuestion) return;

    // Validation requirements: exactly 4 options, valid text, valid correct answer
    if (!editingQuestion.questionText || !editingQuestion.questionText.trim()) {
      setValidationError("Question text is required.");
      return;
    }

    if (
      !Array.isArray(editingQuestion.options) ||
      editingQuestion.options.length !== 4 ||
      editingQuestion.options.some((opt) => !opt || !opt.trim())
    ) {
      setValidationError("Every question must have exactly four non-empty answer options.");
      return;
    }

    if (!editingQuestion.correctAnswer || !editingQuestion.correctAnswer.trim()) {
      setValidationError("Please select the correct answer for this question.");
      return;
    }

    setIsSavingQuestion(true);
    setValidationError(null);

    try {
      const isEditing = Boolean(editingQuestion.id);
      const url = isEditing
        ? `/api/admin/assessment/questions/${editingQuestion.id}`
        : `/api/admin/assessment/questions`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save question.");
      }

      if (isEditing) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === data.question.id ? data.question : q))
        );
        showToast("Question updated successfully.");
      } else {
        setQuestions((prev) => [...prev, data.question]);
        showToast("New assessment question created successfully.");
      }

      setEditingQuestion(null);
    } catch (err: any) {
      setValidationError(err.message || "Failed to save question.");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (settings.beginnerMaxScore >= settings.intermediateMaxScore) {
      showToast("Beginner max score must be strictly less than Intermediate max score.", "error");
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/assessment/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update assessment settings.");

      setSettings(data.settings);
      showToast("Assessment settings updated and published successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save settings.", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SUB-NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-[#E7E2D6] shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubTab("questions")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              subTab === "questions"
                ? "bg-[#15803D] text-white shadow-xs"
                : "text-[#57534E] hover:bg-[#F5F2EB]"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Question Bank ({questions.length})</span>
          </button>

          <button
            onClick={() => setSubTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              subTab === "settings"
                ? "bg-[#15803D] text-white shadow-xs"
                : "text-[#57534E] hover:bg-[#F5F2EB]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Assessment Settings</span>
          </button>

          <button
            onClick={() => setSubTab("submissions")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              subTab === "submissions"
                ? "bg-[#15803D] text-white shadow-xs"
                : "text-[#57534E] hover:bg-[#F5F2EB]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Submissions & Analytics ({submissions.length})</span>
          </button>
        </div>

        {/* Preview as Student Action */}
        <button
          onClick={() => setPreviewStudentModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#DCD4C4] bg-[#FBF9F5] hover:bg-[#EFECE4] text-xs font-semibold text-[#1C1917] transition-colors shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-[#15803D]" />
          <span>Preview as Student</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: QUESTIONS MANAGEMENT
      ========================================================================= */}
      {subTab === "questions" && (
        <div className="space-y-4">
          {/* Controls: Search, Level Filter, Status Filter, Add Question */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7E2D6] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions or answer options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DCD4C4] text-xs sm:text-sm bg-[#FAF8F5] text-[#1C1917] focus:outline-hidden focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DCD4C4] text-xs font-semibold bg-[#FAF8F5] text-[#44403C]"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DCD4C4] text-xs font-semibold bg-[#FAF8F5] text-[#44403C]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Disabled Only</option>
              </select>

              {/* Add New Question Button */}
              <button
                onClick={() => {
                  setValidationError(null);
                  setEditingQuestion({
                    level: "beginner",
                    questionText: "",
                    options: ["A) ", "B) ", "C) ", "D) "],
                    correctAnswer: "",
                    isActive: true,
                    orderIndex: questions.length + 1,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E2D6] text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-[#A8A29E] mx-auto" />
                <p className="text-sm font-semibold text-[#1C1917]">No questions match your filter.</p>
                <p className="text-xs text-[#78716C]">
                  Try clearing search filters or add a new question to the bank.
                </p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                    q.isActive
                      ? "border-[#E7E2D6] shadow-2xs"
                      : "border-stone-300 bg-stone-50/60 opacity-80"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#78716C] bg-[#EFECE4] px-2 py-0.5 rounded-md">
                          #{q.orderIndex}
                        </span>

                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            q.level === "beginner"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : q.level === "intermediate"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-indigo-50 text-indigo-800 border-indigo-200"
                          }`}
                        >
                          {q.level}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            q.isActive
                              ? "bg-emerald-100/70 text-emerald-800"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {q.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#1C1917] leading-snug">
                        {q.questionText}
                      </h4>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect =
                            opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
                            q.correctAnswer.trim().toLowerCase().startsWith(opt.trim().toLowerCase());
                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg border flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                  : "bg-[#FBF9F5] border-[#E7E2D6] text-[#57534E]"
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-bold">
                                  <Check className="w-3.5 h-3.5" /> Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <p className="text-xs text-[#78716C] italic pt-1">
                          💡 Explanation: {q.explanation}
                        </p>
                      )}
                    </div>

                    {/* Actions: Reorder Up/Down, Edit, Toggle, Delete */}
                    <div className="flex items-center gap-1.5 self-end lg:self-center shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-end">
                      {/* Move Up */}
                      <button
                        onClick={() => handleMoveQuestion(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-2 rounded-lg border border-[#DCD4C4] text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F2EB] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMoveQuestion(idx, "down")}
                        disabled={idx === questions.length - 1}
                        title="Move Down"
                        className="p-2 rounded-lg border border-[#DCD4C4] text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F2EB] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setValidationError(null);
                          setEditingQuestion(JSON.parse(JSON.stringify(q)));
                        }}
                        title="Edit Question"
                        className="p-2 rounded-lg border border-[#DCD4C4] text-[#0F2D59] hover:bg-[#F5F2EB]"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(q)}
                        title={q.isActive ? "Disable Question" : "Enable Question"}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                          q.isActive
                            ? "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] hover:bg-[#FEE2E2]"
                            : "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D] hover:bg-[#DCFCE7]"
                        }`}
                      >
                        {q.isActive ? "Disable" : "Enable"}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        title="Delete Question"
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ASSESSMENT SETTINGS
      ========================================================================= */}
      {subTab === "settings" && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E7E2D6] shadow-xs space-y-6">
          <div className="border-b border-[#F0EBE1] pb-4">
            <h3 className="text-xl font-bold text-[#1C1917]">Assessment Settings & Scoring Rules</h3>
            <p className="text-xs text-[#78716C] mt-1">
              Configure introductory titles, scoring thresholds, proficiency feedback messages,
              and WhatsApp inquiry templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Assessment Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917] focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Assessment Subtitle
              </label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917] focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Introductory Description
              </label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917] focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Assessment Instructions
              </label>
              <input
                type="text"
                value={settings.instructions}
                onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917] focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            {/* Total Questions & Marks Per Question */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Total Questions Presented
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.totalQuestions}
                onChange={(e) =>
                  setSettings({ ...settings, totalQuestions: parseInt(e.target.value) || 20 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Marks Per Correct Answer
              </label>
              <input
                type="number"
                min={1}
                value={settings.marksPerQuestion}
                onChange={(e) =>
                  setSettings({ ...settings, marksPerQuestion: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917]"
              />
            </div>

            {/* Thresholds */}
            <div className="md:col-span-2 bg-[#FBF9F5] p-4 rounded-xl border border-[#E7E2D6] space-y-3">
              <h4 className="text-sm font-bold text-[#1C1917]">
                Proficiency Classification Thresholds
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Beginner Maximum Score (0 to X)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={19}
                    value={settings.beginnerMaxScore}
                    onChange={(e) =>
                      setSettings({ ...settings, beginnerMaxScore: parseInt(e.target.value) || 7 })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCD4C4] text-sm bg-white"
                  />
                  <p className="text-[11px] text-[#78716C] mt-1">Default: 7 (Score 0–7 = Beginner)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Intermediate Maximum Score (Beginner+1 to Y)
                  </label>
                  <input
                    type="number"
                    min={settings.beginnerMaxScore + 1}
                    max={20}
                    value={settings.intermediateMaxScore}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        intermediateMaxScore: parseInt(e.target.value) || 14,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCD4C4] text-sm bg-white"
                  />
                  <p className="text-[11px] text-[#78716C] mt-1">
                    Default: 14 (Score 8–14 = Intermediate, 15+ = Advanced)
                  </p>
                </div>
              </div>
            </div>

            {/* Result Feedback Messages */}
            <div className="md:col-span-2 space-y-4 pt-2">
              <h4 className="text-sm font-bold text-[#1C1917]">
                Personalized Level Feedback Messages
              </h4>

              {/* Beginner */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase">Beginner Feedback</span>
                <input
                  type="text"
                  placeholder="Heading"
                  value={settings.beginnerHeading}
                  onChange={(e) => setSettings({ ...settings, beginnerHeading: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-200 text-sm bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Message"
                  value={settings.beginnerMessage}
                  onChange={(e) => setSettings({ ...settings, beginnerMessage: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-200 text-xs sm:text-sm bg-white"
                />
              </div>

              {/* Intermediate */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase">
                  Intermediate Feedback
                </span>
                <input
                  type="text"
                  placeholder="Heading"
                  value={settings.intermediateHeading}
                  onChange={(e) => setSettings({ ...settings, intermediateHeading: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 text-sm bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Message"
                  value={settings.intermediateMessage}
                  onChange={(e) => setSettings({ ...settings, intermediateMessage: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 text-xs sm:text-sm bg-white"
                />
              </div>

              {/* Advanced */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <span className="text-xs font-bold text-indigo-800 uppercase">Advanced Feedback</span>
                <input
                  type="text"
                  placeholder="Heading"
                  value={settings.advancedHeading}
                  onChange={(e) => setSettings({ ...settings, advancedHeading: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-sm bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Message"
                  value={settings.advancedMessage}
                  onChange={(e) => setSettings({ ...settings, advancedMessage: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs sm:text-sm bg-white"
                />
              </div>
            </div>

            {/* CTA Text */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                WhatsApp Button Call-To-Action Text
              </label>
              <input
                type="text"
                value={settings.ctaText}
                onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917]"
              />
            </div>

            {/* WhatsApp Enrollment Template */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                WhatsApp Message Template
              </label>
              <textarea
                rows={4}
                value={settings.whatsAppTemplate}
                onChange={(e) => setSettings({ ...settings, whatsAppTemplate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917] font-mono text-xs"
              />
              <p className="text-[11px] text-[#78716C] mt-1">
                Available tags: <code className="bg-stone-100 px-1 py-0.5 rounded">{"{{score}}"}</code>,{" "}
                <code className="bg-stone-100 px-1 py-0.5 rounded">{"{{total}}"}</code>,{" "}
                <code className="bg-stone-100 px-1 py-0.5 rounded">{"{{accuracy}}"}</code>,{" "}
                <code className="bg-stone-100 px-1 py-0.5 rounded">{"{{level}}"}</code>,{" "}
                <code className="bg-stone-100 px-1 py-0.5 rounded">{"{{name}}"}</code>
              </p>
            </div>

            {/* Assessment Availability */}
            <div className="md:col-span-2 flex items-center justify-between p-4 bg-[#FBF9F5] rounded-xl border border-[#E7E2D6]">
              <div>
                <span className="text-sm font-bold text-[#1C1917] block">
                  Free Assessment Availability
                </span>
                <span className="text-xs text-[#78716C]">
                  When disabled, visitors will see that the assessment is temporarily paused.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isActive: !settings.isActive })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  settings.isActive
                    ? "bg-[#15803D] text-white"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {settings.isActive ? "Published & Active" : "Assessment Paused"}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0EBE1] flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Assessment Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SUBMISSIONS & ANALYTICS
      ========================================================================= */}
      {subTab === "submissions" && (
        <div className="space-y-6">
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs">
              <span className="text-xs font-semibold text-[#78716C] uppercase">Total Attempts</span>
              <p className="text-3xl font-extrabold text-[#1C1917] mt-1">{stats.totalAttempts}</p>
              <span className="text-[11px] text-[#15803D] font-medium">Real student submissions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs">
              <span className="text-xs font-semibold text-[#78716C] uppercase">Average Score</span>
              <p className="text-3xl font-extrabold text-[#15803D] mt-1">
                {stats.averageScore}/20
              </p>
              <span className="text-[11px] text-[#78716C] font-medium">
                {stats.averageAccuracy}% average accuracy
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs">
              <span className="text-xs font-semibold text-[#78716C] uppercase">
                Proficiency Levels
              </span>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  {stats.beginnerCount} Beg
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {stats.intermediateCount} Int
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  {stats.advancedCount} Adv
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E2D6] shadow-xs">
              <span className="text-xs font-semibold text-[#78716C] uppercase">Questions Active</span>
              <p className="text-3xl font-extrabold text-[#0F2D59] mt-1">
                {questions.filter((q) => q.isActive).length}/{questions.length}
              </p>
              <span className="text-[11px] text-[#78716C] font-medium">Published in quiz</span>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-[#E7E2D6] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#F0EBE1] flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-[#1C1917]">Recent Assessment Submissions</h4>
                <p className="text-xs text-[#78716C]">
                  Student assessment attempts with calculated marks and WhatsApp inquiry status
                </p>
              </div>
              <span className="text-xs font-semibold bg-[#EFECE4] px-3 py-1 rounded-full text-[#44403C]">
                {submissions.length} Total Records
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <BarChart3 className="w-8 h-8 text-[#A8A29E] mx-auto" />
                <p className="text-sm font-semibold text-[#1C1917]">No assessment attempts recorded yet.</p>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                  When new visitors complete the free 20-question grammar assessment, their verified
                  results will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF8F5] border-b border-[#E7E2D6] text-[#57534E] uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Student</th>
                      <th className="py-3 px-4 font-bold">Score</th>
                      <th className="py-3 px-4 font-bold">Accuracy</th>
                      <th className="py-3 px-4 font-bold">Level</th>
                      <th className="py-3 px-4 font-bold">Date & Time</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE1]">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FBF9F5] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#1C1917]">
                          {sub.studentName || <span className="text-[#A8A29E] italic">Anonymous Student</span>}
                          {sub.studentEmail && (
                            <span className="block text-[11px] text-[#78716C]">{sub.studentEmail}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#15803D]">
                          {sub.score}/{sub.totalQuestions}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1C1917]">
                          {sub.accuracyPercentage}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                              sub.level === "beginner"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : sub.level === "intermediate"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-indigo-50 text-indigo-800 border-indigo-200"
                            }`}
                          >
                            {sub.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#78716C] text-xs">
                          {formatDisplayDate(sub.submittedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-3 py-1 bg-[#EFECE4] hover:bg-[#E5E0D5] text-[#1C1917] rounded-lg text-xs font-semibold transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT QUESTION
      ========================================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#E7E2D6] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
              <h3 className="text-lg font-bold text-[#1C1917]">
                {editingQuestion.id ? `Edit Question #${editingQuestion.orderIndex}` : "Add New Question"}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-[#78716C] hover:bg-[#F5F2EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Level selection */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Proficiency Level Category
              </label>
              <select
                value={editingQuestion.level || "beginner"}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    level: e.target.value as AssessmentLevel,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#DCD4C4] text-xs font-semibold bg-[#FAF8F5] text-[#1C1917]"
              >
                <option value="beginner">Beginner Level</option>
                <option value="intermediate">Intermediate Level</option>
                <option value="advanced">Advanced Level</option>
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={editingQuestion.questionText || ""}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                }
                placeholder="e.g. She _____ to school every day."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD4C4] text-sm text-[#1C1917]"
              />
            </div>

            {/* 4 Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#44403C]">
                Four Answer Options & Correct Selection <span className="text-red-500">*</span>
              </label>
              {(editingQuestion.options || ["", "", "", ""]).map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                const isCorrect =
                  editingQuestion.correctAnswer &&
                  (opt.trim().toLowerCase() === editingQuestion.correctAnswer.trim().toLowerCase() ||
                    editingQuestion.correctAnswer.trim().toLowerCase().startsWith(opt.trim().toLowerCase()));

                return (
                  <div key={optIdx} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-bold text-[#78716C] text-center">{letter})</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...(editingQuestion.options || ["", "", "", ""])];
                        newOptions[optIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${letter}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#DCD4C4] text-xs text-[#1C1917]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuestion({ ...editingQuestion, correctAnswer: opt })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                        isCorrect
                          ? "bg-[#15803D] text-white border-[#15803D]"
                          : "bg-white text-[#78716C] border-[#DCD4C4] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      {isCorrect ? "✓ Correct" : "Mark Correct"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Grammar Explanation (Shown to students after submission)
              </label>
              <textarea
                rows={2}
                value={editingQuestion.explanation || ""}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                }
                placeholder="e.g. Third-person singular requires verb ending in -s."
                className="w-full px-3.5 py-2 rounded-xl border border-[#DCD4C4] text-xs text-[#1C1917]"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl border border-[#DCD4C4] text-xs font-semibold text-[#44403C] hover:bg-[#F5F2EB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuestionSubmit}
                disabled={isSavingQuestion}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs"
              >
                {isSavingQuestion ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Question</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW SUBMISSION DETAILS
      ========================================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#E7E2D6] shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">
                  {selectedSubmission.studentName || "Anonymous Student"}&apos;s Assessment
                </h3>
                <span className="text-xs text-[#78716C]">
                  Submitted on {formatDisplayDate(selectedSubmission.submittedAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-[#78716C] hover:bg-[#F5F2EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#FBF9F5] p-3 rounded-xl border border-[#E7E2D6]">
                <span className="text-[11px] text-[#78716C] block">Score</span>
                <span className="text-xl font-bold text-[#15803D]">
                  {selectedSubmission.score}/{selectedSubmission.totalQuestions}
                </span>
              </div>
              <div className="bg-[#FBF9F5] p-3 rounded-xl border border-[#E7E2D6]">
                <span className="text-[11px] text-[#78716C] block">Accuracy</span>
                <span className="text-xl font-bold text-[#1C1917]">
                  {selectedSubmission.accuracyPercentage}%
                </span>
              </div>
              <div className="bg-[#FBF9F5] p-3 rounded-xl border border-[#E7E2D6]">
                <span className="text-[11px] text-[#78716C] block">Level</span>
                <span className="text-xs font-bold text-[#0F2D59] capitalize">
                  {selectedSubmission.level}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-[#44403C] uppercase tracking-wider">
                Submitted Answers Log ({Object.keys(selectedSubmission.answers || {}).length} questions)
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {Object.entries(selectedSubmission.answers || {}).map(([qId, ans], idx) => {
                  const q = questions.find((item) => item.id === qId);
                  return (
                    <div
                      key={qId}
                      className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D6] text-xs space-y-0.5"
                    >
                      <span className="font-semibold text-[#1C1917]">
                        Q{idx + 1}. {q?.questionText || qId}
                      </span>
                      <div className="text-[11px] text-[#57534E]">
                        Selected: <strong className="text-[#15803D]">{ans}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EBE1] flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-[#EFECE4] text-[#1C1917] rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel="Confirm Delete"
        isDestructive={true}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* STUDENT PREVIEW MODAL */}
      {previewStudentModal && (
        <AssessmentQuizModal
          isOpen={previewStudentModal}
          onClose={() => setPreviewStudentModal(false)}
          initialQuestions={questions.filter((q) => q.isActive)}
          initialSettings={settings}
          forceStart={true}
        />
      )}
    </div>
  );
}
