import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStudentCompleteCourseAccessLogs } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const { studentId } = params;

    const logs = await getStudentCompleteCourseAccessLogs(studentId);
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

