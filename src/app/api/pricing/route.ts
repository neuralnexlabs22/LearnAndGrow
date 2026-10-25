import { NextResponse } from "next/server";
import { getCoursePricing } from "@/lib/data-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public endpoint: Get current course pricing and fee breakdown
 */
export async function GET() {
  try {
    const pricing = await getCoursePricing();
    return NextResponse.json(pricing, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load pricing." },
      { status: 500 }
    );
  }
}
