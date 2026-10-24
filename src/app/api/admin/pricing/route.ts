import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCoursePricing, updateCoursePricing } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * Admin endpoint: Fetch current course pricing
 */
export async function GET() {
  try {
    await requireAdmin();
    const pricing = await getCoursePricing();
    return NextResponse.json(pricing);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

/**
 * Admin endpoint: Update course pricing and fee breakdown
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const originalPrice = Number(body.originalPrice);
    const sellingPrice = Number(body.sellingPrice);

    if (isNaN(originalPrice) || isNaN(sellingPrice)) {
      return NextResponse.json(
        { error: "Original and selling prices must be valid numbers." },
        { status: 400 }
      );
    }

    if (sellingPrice < 0 || originalPrice < 0) {
      return NextResponse.json(
        { error: "Prices cannot be negative." },
        { status: 400 }
      );
    }

    const updated = await updateCoursePricing({
      originalPrice,
      sellingPrice,
      currency: body.currency || "₹",
      offerTag: body.offerTag || "LIMITED TIME OFFER",
      isOfferActive: body.isOfferActive !== undefined ? Boolean(body.isOfferActive) : true,
    });

    return NextResponse.json({
      success: true,
      pricing: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update pricing." },
      { status: 400 }
    );
  }
}
