import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAssessmentSettings, updateAssessmentSettings } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Admin endpoint: Fetch full assessment settings
 */
export async function GET() {
  try {
    await requireAdmin();
    const settings = await getAssessmentSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

/**
 * Admin endpoint: Update assessment settings
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const updated = await updateAssessmentSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update assessment settings." },
      { status: 400 }
    );
  }
}
