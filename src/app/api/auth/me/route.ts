import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, subscriptionStatus } = await getCurrentSession();
    return NextResponse.json({
      user,
      subscriptionStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve session." },
      { status: 500 }
    );
  }
}
