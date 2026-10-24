"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MessageSquarePlus, Award, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { StudentReview, UserProfile } from "@/types";
import { StudentReviewCard } from "./StudentReviewCard";
import { ReviewSubmissionModal } from "./ReviewSubmissionModal";

interface ReviewsSectionProps {
  initialReviews: StudentReview[];
  currentUser: UserProfile | null;
  userReview?: StudentReview | null;
}

export function ReviewsSection({
  initialReviews,
  currentUser,
  userReview: initialUserReview,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<StudentReview[]>(initialReviews);
  const [userReview, setUserReview] = useState<StudentReview | null>(
    initialUserReview || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const averageRating =
    approvedReviews.length > 0
      ? (
          approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
          approvedReviews.length
        ).toFixed(1)
      : null;

  const handleReviewSubmitted = (newOrUpdatedReview: StudentReview) => {
    setUserReview(newOrUpdatedReview);
    // If approved, update list
    if (newOrUpdatedReview.status === "approved") {
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === newOrUpdatedReview.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = newOrUpdatedReview;
          return updated;
        }
        return [newOrUpdatedReview, ...prev];
      });
    }
  };

  const handleReviewWithdrawn = () => {
    if (userReview) {
      setReviews((prev) => prev.filter((r) => r.id !== userReview.id));
      setUserReview(null);
    }
  };

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F5F2EB] text-[#78716C] text-xs font-bold uppercase tracking-wider border border-[#E7E2D6]">
            <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Student Success Stories & Verified Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
            Every Step Forward Matters
          </h2>

          <p className="text-sm text-[#57534E] leading-relaxed">
            Read genuine reflections and success stories from adult learners who took the 8-week journey to
            overcome hesitation and build real-world spoken English confidence.
          </p>
        </div>

        {/* Rating Summary & Write Review CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          {averageRating && (
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D4CDBC] flex items-center gap-3">
              <span className="text-2xl font-extrabold text-[#1C1917]">
                {averageRating}
              </span>
              <div>
                <div className="flex items-center gap-0.5 text-[#B45309]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(Number(averageRating))
                          ? "fill-[#B45309] text-[#B45309]"
                          : "text-[#D4CDBC]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[#78716C] block">
                  Based on {approvedReviews.length} approved reviews
                </span>
              </div>
            </div>
          )}

          {currentUser?.role === "student" ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-[#C25E38] hover:bg-[#A94E2C] text-white shadow-xs transition-all hover:shadow"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{userReview ? "Edit Your Review" : "Write a Review"}</span>
            </button>
          ) : !currentUser ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F2EB] text-[#1C1917] border border-[#D4CDBC] shadow-xs transition-all"
            >
              <span>Sign In to Leave a Review</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Reviews Grid */}
      {approvedReviews.length === 0 ? (
        <div className="bg-white border border-[#D4CDBC] rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5F2EB] text-[#78716C] flex items-center justify-center mx-auto">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1917]">
            Student Stories in Progress
          </h3>
          <p className="text-xs text-[#57534E] leading-relaxed">
            Our students are currently progressing through their 8-week spoken English journey. Genuine, administrator-approved student reviews and milestone reflections will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <StudentReviewCard key={rev.id} review={rev} />
          ))}
        </div>
      )}

      {/* Review Submission Modal for Authenticated Students */}
      {currentUser && currentUser.role === "student" && (
        <ReviewSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={currentUser}
          existingReview={userReview}
          onReviewSubmitted={handleReviewSubmitted}
          onReviewWithdrawn={handleReviewWithdrawn}
        />
      )}
    </section>
  );
}
