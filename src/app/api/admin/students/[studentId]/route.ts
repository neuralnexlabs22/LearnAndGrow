import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteStudent, logActivity } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required." },
        { status: 400 }
      );
    }

    const success = await deleteStudent(studentId);

    // Audit log deletion
    await logActivity(
      "delete_student",
      adminUser.email,
      adminUser.id,
      {
        deletedStudentId: studentId,
        performedBy: adminUser.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Student account deleted successfully.",
    });
  } catch (error: any) {
    console.error("Admin delete student error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete student account." },
      { status: 400 }
    );
  }
}

