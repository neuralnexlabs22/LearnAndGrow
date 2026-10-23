import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateStudentSubscription } from "@/lib/data-store";
import { SubscriptionStatus } from "@/types";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const params = await props.params;
    const { studentId } = params;

    const body = await request.json();
    const { status } = body as { status: SubscriptionStatus };

    const validStatuses: SubscriptionStatus[] = [
      "pending",
      "active",
      "rejected",
      "revoked",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updatedSub = await updateStudentSubscription(
      studentId,
      status,
      adminUser.id
    );

    let message = `Student subscription status updated to '${status}'.`;
    if (status === "active") {
      message = "Student enrollment approved! Full access to weekly materials has been unlocked.";
    } else if (status === "revoked") {
      message = "Student subscription revoked. Access to protected materials has been immediately revoked.";
    } else if (status === "rejected") {
      message = "Student subscription rejected.";
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update subscription status." },
      { status: 403 }
    );
  }
}
