import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAssessmentSubmissions, getAssessmentStats } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Admin endpoint: Fetch assessment attempts/submissions and calculated analytics
 */
export async function GET() {
  try {
    await requireAdmin();
    const [submissions, stats] = await Promise.all([
      getAssessmentSubmissions(),
      getAssessmentStats(),
    ]);

    return NextResponse.json({
      submissions,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
