import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateStudentCompletionStatus } from "@/lib/data-store";
import { CompletionStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const { studentId } = params;

    const body = await request.json();
    const { completionStatus } = body as { completionStatus: CompletionStatus };

    const validStatuses: CompletionStatus[] = [
      "enrolled",
      "in_progress",
      "completed",
      "revoked",
    ];

    if (!validStatuses.includes(completionStatus)) {
      return NextResponse.json(
        { error: "Invalid completion status." },
        { status: 400 }
      );
    }

    const updated = await updateStudentCompletionStatus(
      studentId,
      completionStatus
    );

    let msg = `Student course status updated to ${completionStatus}.`;
    if (completionStatus === "completed") {
      msg = `Student verified as Course Completed! Completion counter on Home page updated.`;
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: msg,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update completion status." },
      { status: 403 }
    );
  }
}
