import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getStudentsWithSubscriptions,
  createUser,
  updateStudentSubscription,
  updateStudentCompletionStatus,
} from "@/lib/data-store";

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

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const {
      name,
      email,
      password,
      subscriptionStatus = "active",
      completionStatus = "enrolled",
    } = body;

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

    if (subscriptionStatus && subscriptionStatus !== "pending") {
      await updateStudentSubscription(newUser.id, subscriptionStatus, adminUser.id);
    }

    if (completionStatus && completionStatus !== "enrolled") {
      await updateStudentCompletionStatus(newUser.id, completionStatus);
    }

    const students = await getStudentsWithSubscriptions();

    return NextResponse.json({
      success: true,
      message: `Student account for '${name}' registered successfully.`,
      user: newUser,
      students,
    });
  } catch (error: any) {
    console.error("Admin create student error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create student account." },
      { status: 400 }
    );
  }
}
