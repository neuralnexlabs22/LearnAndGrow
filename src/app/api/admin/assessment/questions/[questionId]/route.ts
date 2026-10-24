import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  saveAssessmentQuestion,
  deleteAssessmentQuestion,
  getAssessmentQuestionById,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Admin endpoint: Update a specific assessment question
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await requireAdmin();
    const { questionId } = await params;
    const body = await req.json();

    const existing = await getAssessmentQuestionById(questionId);
    if (!existing) {
      return NextResponse.json(
        { error: "Assessment question not found." },
        { status: 404 }
      );
    }

    const updated = await saveAssessmentQuestion({
      ...body,
      id: questionId,
    });

    return NextResponse.json({
      success: true,
      question: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update question." },
      { status: 400 }
    );
  }
}

/**
 * Admin endpoint: Delete an assessment question
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await requireAdmin();
    const { questionId } = await params;

    const existing = await getAssessmentQuestionById(questionId);
    if (!existing) {
      return NextResponse.json(
        { error: "Assessment question not found." },
        { status: 404 }
      );
    }

    const success = await deleteAssessmentQuestion(questionId);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete question." },
      { status: 400 }
    );
  }
}
