import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateReviewModeration, deleteStudentReview } from "@/lib/data-store";
import { ReviewStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ reviewId: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const { reviewId } = params;

    const body = await request.json();
    const { status, isFeatured } = body as {
      status?: ReviewStatus;
      isFeatured?: boolean;
    };

    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid review status." },
        { status: 400 }
      );
    }

    const updated = await updateReviewModeration(
      reviewId,
      status || "approved",
      isFeatured
    );

    return NextResponse.json({
      success: true,
      review: updated,
      message: `Review moderation status updated to ${updated.status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update review." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ reviewId: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const { reviewId } = params;

    await deleteStudentReview(reviewId);

    return NextResponse.json({
      success: true,
      message: "Review was permanently removed.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete review." },
      { status: 400 }
    );
  }
}
