import { NextResponse } from "next/server";
import { getAssessmentSettings } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to fetch active assessment configuration
 */
export async function GET() {
  try {
    const settings = await getAssessmentSettings();
    return NextResponse.json({
      title: settings.title,
      subtitle: settings.subtitle,
      description: settings.description,
      instructions: settings.instructions,
      totalQuestions: settings.totalQuestions,
      ctaText: settings.ctaText,
      isActive: settings.isActive,
    });
  } catch (error: any) {
    console.error("Error fetching assessment settings:", error);
    return NextResponse.json(
      { error: "Failed to load assessment settings." },
      { status: 500 }
    );
  }
}
