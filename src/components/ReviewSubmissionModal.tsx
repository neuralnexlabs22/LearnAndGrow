"use client";

import { useState, useEffect } from "react";
import { Star, X, Loader2, Upload, Trash2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { StudentReview, UserProfile } from "@/types";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  existingReview?: StudentReview | null;
  onReviewSubmitted: (review: StudentReview) => void;
  onReviewWithdrawn?: () => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  currentUser,
  existingReview,
  onReviewSubmitted,
  onReviewWithdrawn,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(existingReview?.feedback || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentUser.photoUrl || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setFeedback(existingReview.feedback);
      setPhotoUrl(existingReview.studentPhotoUrl || currentUser.photoUrl || null);
    }
  }, [existingReview, currentUser]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image exceeds 5MB size limit.");
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/students/${currentUser.id}/photo`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPhotoUrl(data.photoUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await fetch(`/api/students/${currentUser.id}/photo`, { method: "DELETE" });
      setPhotoUrl(null);
    } catch (e) {
      console.warn("Could not remove photo", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(data.message);
      onReviewSubmitted(data.review);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw your review?")) return;

    setIsWithdrawing(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/reviews/my", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (onReviewWithdrawn) onReviewWithdrawn();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to withdraw review.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#D4CDBC] rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl animate-scale-up space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D6]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38]">
              Student Feedback
            </span>
            <h3 className="text-lg font-bold text-[#1C1917]">
              {existingReview ? "Edit Your Course Review" : "Share Your English Learning Experience"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Notice about moderation */}
        <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2.5 text-xs text-[#92400E]">
          <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Reviews are held for administrator approval before appearing publicly to ensure genuine student participation.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
              Your Course Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? "fill-[#B45309] text-[#B45309]"
                        : "text-[#D4CDBC]"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#1C1917] ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
              Your Review & English Progress
            </label>
            <textarea
              required
              rows={4}
              minLength={10}
              maxLength={1000}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How did the 8-week syllabus, speaking exercises, and grammar notes help your everyday communication?..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4CDBC] bg-white text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C25E38]"
            />
            <span className="text-[10px] text-[#78716C] block text-right mt-1">
              {feedback.length} / 1000 characters
            </span>
          </div>

          {/* Optional Profile Photo Section */}
          <div className="p-3.5 rounded-xl border border-[#E7E2D6] bg-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={photoUrl || `/api/students/${currentUser.id}/photo`}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#D4CDBC]"
              />
              <div>
                <span className="text-xs font-bold text-[#1C1917] block">
                  Student Profile Photo
                </span>
                <span className="text-[11px] text-[#78716C]">
                  {photoUrl ? "Custom photo uploaded" : "Default avatar active"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F2EB] hover:bg-[#EFECE4] text-[#1C1917] border border-[#D4CDBC] cursor-pointer transition-colors">
                {isUploadingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{photoUrl ? "Change" : "Upload"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2]"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {existingReview ? (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="text-xs font-semibold text-[#DC2626] hover:text-[#991B1B] transition-colors disabled:opacity-50"
              >
                {isWithdrawing ? "Withdrawing..." : "Withdraw Review"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#57534E] hover:bg-[#EFECE4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || feedback.trim().length < 10}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{existingReview ? "Update Review" : "Submit Review"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
