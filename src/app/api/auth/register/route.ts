import { NextResponse } from "next/server";
import { createUser } from "@/lib/data-store";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const newUser = await createUser(name, email, password, "student");

    const response = NextResponse.json({
      success: true,
      user: newUser,
      subscriptionStatus: "active",
      message: `Account created successfully for ${name}! Welcome to the course.`,
    });

    // Attach cookie directly to the response and cookieStore
    await setSessionCookie(newUser.id, response);

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create account." },
      { status: 400 }
    );
  }
}
