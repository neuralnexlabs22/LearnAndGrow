import { NextResponse } from "next/server";
import { getAssessmentQuestionsForStudent, getAssessmentSettings } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to fetch active assessment questions for students.
 * Strictly excludes answer keys and explanations to maintain assessment integrity.
 */
export async function GET() {
  try {
    const settings = await getAssessmentSettings();
    if (!settings.isActive) {
      return NextResponse.json(
        { error: "Assessment is currently inactive.", isActive: false },
        { status: 503 }
      );
    }

    const questions = await getAssessmentQuestionsForStudent();
    return NextResponse.json({
      success: true,
      settings: {
        title: settings.title,
        subtitle: settings.subtitle,
        description: settings.description,
        instructions: settings.instructions,
        totalQuestions: settings.totalQuestions,
      },
      questions,
    });
  } catch (error: any) {
    console.error("Error fetching assessment questions for student:", error);
    return NextResponse.json(
      { error: "Failed to load assessment questions." },
      { status: 500 }
    );
  }
}
