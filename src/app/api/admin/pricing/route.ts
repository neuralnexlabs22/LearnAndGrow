import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCoursePricing, updateCoursePricing } from "@/lib/data-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Admin endpoint: Fetch current course pricing
 */
export async function GET() {
  try {
    await requireAdmin();
    const pricing = await getCoursePricing();
    return NextResponse.json(pricing, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
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

    // Invalidate caches across the site so all visitors immediately see the updated fees
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/course");
      revalidatePath("/admin");
    } catch (err) {
      console.warn("revalidatePath warning:", err);
    }

    return NextResponse.json(
      {
        success: true,
        pricing: updated,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update pricing." },
      { status: 400 }
    );
  }
}
