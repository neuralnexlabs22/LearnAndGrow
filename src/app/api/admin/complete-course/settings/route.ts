import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getCompleteCourseSettings,
  updateCompleteCourseSettings,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getCompleteCourseSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, description, coverImageUrl, isPublished } = body;

    const updated = await updateCompleteCourseSettings({
      title,
      description,
      coverImageUrl,
      isPublished,
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Complete Course details updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update Complete Course details." },
      { status: 500 }
    );
  }
}
