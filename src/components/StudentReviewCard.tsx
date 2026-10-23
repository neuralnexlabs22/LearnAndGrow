import { Star, CheckCircle2, Award, Calendar } from "lucide-react";
import { StudentReview } from "@/types";

interface StudentReviewCardProps {
  review: StudentReview;
}

export function StudentReviewCard({ review }: StudentReviewCardProps) {
  const photoUrl = review.studentPhotoUrl || `/api/students/${review.studentId}/photo`;

  return (
    <div className="bg-white border border-[#D4CDBC] rounded-2xl p-6 flex flex-col justify-between beige-card-shadow beige-card-hover space-y-4">
      <div className="space-y-3">
        {/* Header with Photo, Name & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt={review.studentName}
              className="w-11 h-11 rounded-full object-cover border border-[#DCD4C4] bg-[#FAF8F5] shrink-0"
              onError={(e) => {
                // Fallback to default avatar
                (e.target as HTMLElement).setAttribute(
                  "src",
                  `/api/students/${review.studentId}/photo`
                );
              }}
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-[#1C1917]">
                  {review.studentName}
                </h4>
                {review.isCompletedStudent && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    <Award className="w-2.5 h-2.5 text-[#059669]" />
                    <span>Course Graduate</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#78716C] block">
                Verified Student
              </span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 text-[#B45309] shrink-0 bg-[#FEF3C7]/60 px-2 py-1 rounded-lg border border-[#FDE68A]/60">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating
                    ? "fill-[#B45309] text-[#B45309]"
                    : "text-[#D4CDBC]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Feedback Text */}
        <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed italic">
          &ldquo;{review.feedback}&rdquo;
        </p>
      </div>

      {/* Footer with date */}
      <div className="pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-[11px] text-[#78716C]">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#15803D]" /> Approved Student Review
        </span>
        <span className="flex items-center gap-1 text-[#A8A29E]">
          <Calendar className="w-3 h-3" />
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
