"use client";

import { useState } from "react";
import { CourseWeek, SubscriptionStatus, UserRole } from "@/types";
import { WeeklyModuleCard } from "@/components/WeeklyModuleCard";
import { PdfViewerModal } from "@/components/PdfViewerModal";

interface CourseModuleListProps {
  weeks: CourseWeek[];
  hasAccess: boolean;
  userRole: UserRole | null;
  subscriptionStatus: SubscriptionStatus | null;
}

export function CourseModuleList({
  weeks,
  hasAccess,
  userRole,
  subscriptionStatus,
}: CourseModuleListProps) {
  const [selectedWeek, setSelectedWeek] = useState<CourseWeek | null>(null);

  const handleViewPdf = (week: CourseWeek) => {
    setSelectedWeek(week);
  };

  const handleCloseModal = () => {
    setSelectedWeek(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weeks.map((week) => (
          <WeeklyModuleCard
            key={week.id}
            week={week}
            hasAccess={hasAccess}
            userRole={userRole}
            subscriptionStatus={subscriptionStatus}
            onViewPdf={handleViewPdf}
          />
        ))}
      </div>

      {selectedWeek && (
        <PdfViewerModal
          isOpen={!!selectedWeek}
          onClose={handleCloseModal}
          weekNumber={selectedWeek.weekNumber}
          title={selectedWeek.title}
          pdfFilename={selectedWeek.pdfFilename}
        />
      )}
    </>
  );
}
