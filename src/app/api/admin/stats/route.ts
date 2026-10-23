import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
