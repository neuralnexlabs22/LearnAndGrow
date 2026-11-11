import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { reorderCompleteCourseResources } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds array is required." },
        { status: 400 }
      );
    }

    await reorderCompleteCourseResources(orderedIds);

    return NextResponse.json({
      success: true,
      message: "Resources reordered successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to reorder resources." },
      { status: 500 }
    );
  }
}

