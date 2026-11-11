import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateStudentCompleteCourseAccess } from "@/lib/data-store";
import { CompleteCourseAccessStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const params = await props.params;
    const { studentId } = params;

    const body = await request.json();
    const { status, notes } = body as {
      status: CompleteCourseAccessStatus;
      notes?: string;
    };

    if (status !== "active" && status !== "revoked") {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'revoked'." },
        { status: 400 }
      );
    }

    const updatedAccess = await updateStudentCompleteCourseAccess(
      studentId,
      status,
      adminUser.id,
      notes
    );

    const message =
      status === "active"
        ? "Complete Course access granted! Student can now view and download all Complete Course materials."
        : "Complete Course access revoked. Student access to Complete Course materials is immediately blocked.";

    return NextResponse.json({
      success: true,
      access: updatedAccess,
      message,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/complete-course/access/[studentId] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update Complete Course access." },
      { status: 500 }
    );
  }
}
