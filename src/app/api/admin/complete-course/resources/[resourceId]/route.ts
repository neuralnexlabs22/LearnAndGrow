import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  updateCompleteCourseResource,
  deleteCompleteCourseResource,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const { resourceId } = params;

    const body = await request.json();
    const updated = await updateCompleteCourseResource(resourceId, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resource: updated,
      message: "Resource updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update resource." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const { resourceId } = params;

    const deleted = await deleteCompleteCourseResource(resourceId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Resource not found or could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully from Complete Course.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete resource." },
      { status: 500 }
    );
  }
}

