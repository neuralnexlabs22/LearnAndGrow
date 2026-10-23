import { NextResponse } from "next/server";
import { getUserByEmail, getStudentSubscription } from "@/lib/data-store";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.passwordHash !== password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Set cookie
    await setSessionCookie(user.id);

    const sub = await getStudentSubscription(user.id);
    const subscriptionStatus = user.role === "admin" ? "active" : sub?.status || "pending";

    const { passwordHash: _, ...safeProfile } = user;

    return NextResponse.json({
      success: true,
      user: safeProfile,
      subscriptionStatus,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}
