"use client";

import apiClient from "@/lib/apiClient";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STORAGE_KEY = "viztutor-visitor-id";

const getVisitorId = () => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const next =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return "";
  }
};

/**
 * Sends one page-view ping per navigation. The backend ignores repeated views
 * of the same path within five minutes; unique visitor counting is per browser
 * via the persisted visitor id.
 */
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/_next")) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    void apiClient("/analytics/visit", {
      method: "POST",
      body: {
        visitorId,
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      },
    }).catch(() => {
      // Analytics is best-effort: never disturb the learner experience.
    });
  }, [pathname]);

  return null;
}
