import { cookies } from "next/headers";
import { UserProfile, SubscriptionStatus, UserRole } from "@/types";
import { getUserById, getStudentSubscription } from "./data-store";

const SESSION_COOKIE_NAME = "course_session_user_id";

export interface CurrentSession {
  user: UserProfile | null;
  subscriptionStatus: SubscriptionStatus | null;
}

/**
 * Retrieves the currently authenticated user and their subscription status from the session cookie
 */
export async function getCurrentSession(): Promise<CurrentSession> {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionUserId) {
      return { user: null, subscriptionStatus: null };
    }

    const user = await getUserById(sessionUserId);
    if (!user) {
      return { user: null, subscriptionStatus: null };
    }

    if (user.role === "admin") {
      return { user, subscriptionStatus: "active" };
    }

    const sub = await getStudentSubscription(user.id);
    const subscriptionStatus = sub ? sub.status : "pending";

    return { user, subscriptionStatus };
  } catch (error) {
    console.error("Error reading current session:", error);
    return { user: null, subscriptionStatus: null };
  }
}

/**
 * Sets the session cookie on successful login/registration
 */
export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
}

/**
 * Clears the session cookie on sign out
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Requires the current caller to be an authenticated administrator
 */
export async function requireAdmin(): Promise<UserProfile> {
  const { user } = await getCurrentSession();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Administrator permissions required.");
  }
  return user;
}

/**
 * Requires the caller to be either an admin OR an active student with approved subscription
 */
export async function requireActiveAccess(): Promise<{
  user: UserProfile;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}> {
  const { user, subscriptionStatus } = await getCurrentSession();

  if (!user) {
    const err = new Error("Authentication required to access course materials.");
    (err as any).statusCode = 401;
    throw err;
  }

  if (user.role === "admin") {
    return { user, role: "admin", subscriptionStatus: "active" };
  }

  if (subscriptionStatus !== "active") {
    const err = new Error(
      `Access restricted: Your subscription is currently '${subscriptionStatus}'. Only approved, active subscriptions may access materials.`
    );
    (err as any).statusCode = 403;
    throw err;
  }

  return { user, role: "student", subscriptionStatus: "active" };
}
