import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  getApprovedReviews,
  createOrUpdateStudentReview,
} from "@/lib/data-store";

export const dynamic = "force-dynamic";

// Public endpoint: Fetch approved reviews
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";

    const reviews = await getApprovedReviews(featuredOnly);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve student reviews." },
      { status: 500 }
    );
  }
}

// Authenticated student endpoint: Submit or update course review
export async function POST(request: Request) {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to submit a review." },
        { status: 401 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Administrators cannot submit student reviews." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, feedback } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please provide a valid rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    if (!feedback || typeof feedback !== "string" || feedback.trim().length < 10) {
      return NextResponse.json(
        { error: "Review feedback must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const review = await createOrUpdateStudentReview(
      user.id,
      user.name,
      user.email,
      rating,
      feedback,
      user.photoUrl
    );

    return NextResponse.json({
      success: true,
      review,
      message:
        "Thank you! Your review has been submitted for administrator moderation and will be published once approved.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
