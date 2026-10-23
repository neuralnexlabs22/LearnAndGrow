import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to sign out." },
      { status: 500 }
    );
  }
}
