import { Award, CheckCircle2, Users, Sparkles, BookCheck } from "lucide-react";

interface CourseCompletionCounterProps {
  completedCount: number;
  totalStudents: number;
}

export function CourseCompletionCounter({
  completedCount,
  totalStudents,
}: CourseCompletionCounterProps) {
  return (
    <section className="py-14 bg-gradient-to-b from-[#F5F2EB] to-[#FAF8F5] border-y border-[#E7E2D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#D4CDBC] rounded-3xl p-8 sm:p-12 beige-card-shadow relative overflow-hidden">
          {/* Subtle warm decorative background element */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C25E38]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-xs font-bold tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Verified Educational Milestones</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-tight leading-snug">
                Students Who Successfully Completed the 8-Week Course
              </h2>

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-xl">
                Every completion recorded below reflects an individual student who
                attended the weekly modules, submitted their homework speaking drills,
                and passed the final comprehensive assessment evaluated by the instructor.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#78716C]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>100% Verified Unique Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Zero Fabricated Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Instructor-Verified Assessment</span>
                </div>
              </div>
            </div>

            {/* Right Live Counter Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-[#FAF8F5] border-2 border-[#D4CDBC] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#C25E38] text-white flex items-center justify-center mx-auto shadow-sm">
                  <Award className="w-7 h-7" />
                </div>

                <div>
                  <span className="text-5xl sm:text-6xl font-black text-[#1C1917] tracking-tight font-mono block">
                    {completedCount}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C25E38] mt-1 block">
                    Verified Course Graduates
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E7E2D6] flex items-center justify-between text-xs text-[#78716C]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#57534E]" />
                    <span>Total Enrolled: {totalStudents}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#15803D]">
                    <Sparkles className="w-3 h-3" />
                    <span>Live Metric</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
