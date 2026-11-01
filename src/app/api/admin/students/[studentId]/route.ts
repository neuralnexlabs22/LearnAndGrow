import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteStudent, logActivity } from "@/lib/data-store";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const params = await props.params;
    const { studentId } = params;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required." },
        { status: 400 }
      );
    }

    // 1. Delete directly from Supabase (subscriptions, reviews, profiles)
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        await supabase.from("subscriptions").delete().eq("student_id", studentId);
        await supabase.from("reviews").delete().eq("student_id", studentId);
        const { error: pErr } = await supabase.from("profiles").delete().eq("id", studentId);
        if (pErr) {
          console.error("Direct Supabase delete profile error:", pErr);
        }
      } catch (dbErr) {
        console.error("Direct Supabase delete exception:", dbErr);
      }
    }

    // 2. Clean up data store memory and disk cache
    try {
      await deleteStudent(studentId);
    } catch (storeErr) {
      console.warn("deleteStudent fallback warning:", storeErr);
    }

    // 3. Log audit event
    try {
      await logActivity(
        "delete_student",
        adminUser.email,
        adminUser.id,
        {
          deletedStudentId: studentId,
          performedBy: adminUser.email,
        }
      );
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Student account deleted successfully from database.",
    });
  } catch (error: any) {
    console.error("Admin delete student error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete student account." },
      { status: 400 }
    );
  }
}
