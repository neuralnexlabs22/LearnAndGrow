import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAssessmentQuestions,
  saveAssessmentQuestion,
  reorderAssessmentQuestions,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Admin endpoint: List all questions (including inactive)
 */
export async function GET() {
  try {
    await requireAdmin();
    const questions = await getAssessmentQuestions(true);
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

/**
 * Admin endpoint: Create a new question
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const created = await saveAssessmentQuestion(body);
    return NextResponse.json({
      success: true,
      question: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create assessment question." },
      { status: 400 }
    );
  }
}

/**
 * Admin endpoint: Reorder questions
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (!Array.isArray(body.orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds array is required for reordering." },
        { status: 400 }
      );
    }

    await reorderAssessmentQuestions(body.orderedIds);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to reorder questions." },
      { status: 400 }
    );
  }
}
