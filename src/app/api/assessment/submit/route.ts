import { NextRequest, NextResponse } from "next/server";
import { submitAssessmentAttempt, getAssessmentSettings } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to submit assessment answers and receive trusted evaluation.
 * Performs all scoring and level classification server-side.
 */
export async function POST(req: NextRequest) {
  try {
    const settings = await getAssessmentSettings();
    if (!settings.isActive) {
      return NextResponse.json(
        { error: "Assessment is currently inactive." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { answers, studentName, studentEmail } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Invalid submission: answers map is required." },
        { status: 400 }
      );
    }

    const result = await submitAssessmentAttempt({
      answers,
      studentName: typeof studentName === "string" ? studentName.trim() : undefined,
      studentEmail: typeof studentEmail === "string" ? studentEmail.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Error submitting assessment attempt:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process assessment submission." },
      { status: 500 }
    );
  }
}
