import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { UserProfile, SubscriptionStatus, UserRole } from "@/types";
import {
  getUserById,
  getStudentSubscription,
  hasStudentCompleteCourseAccess,
} from "./data-store";

export const SESSION_COOKIE_NAME = "course_session_user_id";

export interface CurrentSession {
  user: UserProfile | null;
  subscriptionStatus: SubscriptionStatus | null;
  hasCompleteCourseAccess: boolean;
}

/**
 * Retrieves the currently authenticated user and their subscription status from the session cookie
 */
export async function getCurrentSession(): Promise<CurrentSession> {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionUserId) {
      return { user: null, subscriptionStatus: null, hasCompleteCourseAccess: false };
    }

    const user = await getUserById(sessionUserId);
    if (!user) {
      return { user: null, subscriptionStatus: null, hasCompleteCourseAccess: false };
    }

    if (user.role === "admin") {
      return { user, subscriptionStatus: "active", hasCompleteCourseAccess: true };
    }

    const sub = await getStudentSubscription(user.id);
    const subscriptionStatus = sub ? sub.status : "active";
    const hasCompleteCourseAccessVal = await hasStudentCompleteCourseAccess(user.id);

    return {
      user,
      subscriptionStatus,
      hasCompleteCourseAccess: hasCompleteCourseAccessVal,
    };
  } catch (error) {
    console.error("Error reading current session:", error);
    return { user: null, subscriptionStatus: null, hasCompleteCourseAccess: false };
  }
}

/**
 * Sets the session cookie on successful login/registration.
 * If a NextResponse is passed, directly sets the Set-Cookie header on the response.
 */
export async function setSessionCookie(
  userId: string,
  response?: NextResponse
): Promise<void> {
  // Only enforce secure cookies if the app is explicitly running over HTTPS.
  // Over plain HTTP (such as localhost:3000), secure:true causes browsers to silently drop the cookie.
  const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;

  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  };

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, cookieOptions);
  } catch (err) {
    // Non-fatal if called where cookies() is read-only
  }

  if (response) {
    response.cookies.set(SESSION_COOKIE_NAME, userId, cookieOptions);
  }
}

/**
 * Clears the session cookie on sign out
 */
export async function clearSessionCookie(response?: NextResponse): Promise<void> {
  const deleteOptions = {
    path: "/",
    maxAge: 0,
  };

  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    // Non-fatal
  }

  if (response) {
    response.cookies.delete(SESSION_COOKIE_NAME);
    response.cookies.set(SESSION_COOKIE_NAME, "", deleteOptions);
  }
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

/**
 * Requires the caller to be either an admin OR a student with approved Complete Course access
 */
export async function requireCompleteCourseAccess(): Promise<{
  user: UserProfile;
  role: UserRole;
  hasCompleteCourseAccess: boolean;
}> {
  const { user, hasCompleteCourseAccess } = await getCurrentSession();

  if (!user) {
    const err = new Error("Authentication required to access Complete Course materials.");
    (err as any).statusCode = 401;
    throw err;
  }

  if (user.role === "admin") {
    return { user, role: "admin", hasCompleteCourseAccess: true };
  }

  if (!hasCompleteCourseAccess) {
    const err = new Error(
      "Access restricted: Complete Course access has not been granted for this account. Please contact the administrator."
    );
    (err as any).statusCode = 403;
    throw err;
  }

  return { user, role: "student", hasCompleteCourseAccess: true };
}
