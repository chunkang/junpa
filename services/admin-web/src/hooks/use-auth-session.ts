"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";

export function useAuthSession() {
  const { data: session, status, update } = useSession();
  const isRefreshing = useRef(false);

  const refreshSession = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      await update();
    } finally {
      isRefreshing.current = false;
    }
  }, [update]);

  // Check for session errors (e.g., RefreshTokenExpired)
  useEffect(() => {
    if (session?.error === "RefreshTokenExpired") {
      signIn("google", { callbackUrl: window.location.pathname });
    }
  }, [session?.error]);

  // Proactive refresh when session nears expiry
  useEffect(() => {
    if (status !== "authenticated" || !session?.expires) return;

    const checkExpiry = () => {
      const expiresAt = new Date(session.expires).getTime();
      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      if (expiresAt - now < twoMinutes) {
        refreshSession();
      }
    };

    const interval = setInterval(checkExpiry, 60 * 1000); // Check every minute
    checkExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [status, session?.expires, refreshSession]);

  // Refresh on tab refocus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "authenticated") {
        refreshSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, refreshSession]);

  return { session, status, update: refreshSession };
}
