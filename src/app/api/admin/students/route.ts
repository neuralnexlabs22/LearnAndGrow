import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStudentsWithSubscriptions } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const students = await getStudentsWithSubscriptions();
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
