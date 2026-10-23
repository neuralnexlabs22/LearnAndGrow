import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllReviews } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
