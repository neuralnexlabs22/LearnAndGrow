"use client";

import { useEffect } from "react";
import { UserProfile } from "@/types";

interface CourseSessionSyncProps {
  initialUser: UserProfile | null;
}

export function CourseSessionSync({ initialUser }: CourseSessionSyncProps) {
  useEffect(() => {
    // If server rendered without an active user, double check if a session cookie exists client-side
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            // User session is active, reload page to hydrate server session
            window.location.reload();
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  return null;
}

