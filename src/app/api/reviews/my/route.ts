import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getStudentReview, deleteStudentReview } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ review: null });
    }

    const review = await getStudentReview(user.id);
    return NextResponse.json({ review });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load review." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const existing = await getStudentReview(user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "No review found to withdraw." },
        { status: 404 }
      );
    }

    await deleteStudentReview(existing.id);
    return NextResponse.json({
      success: true,
      message: "Your review has been successfully withdrawn.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to withdraw review." },
      { status: 500 }
    );
  }
}
