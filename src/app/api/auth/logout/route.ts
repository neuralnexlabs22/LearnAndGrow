import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    await clearSessionCookie(response);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to sign out." },
      { status: 500 }
    );
  }
}
