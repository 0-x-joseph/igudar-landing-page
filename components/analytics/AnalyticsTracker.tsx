"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { startAnalytics, track } from "@/lib/analytics";

/** A `data-track` value is a stable CTA id, never text the visitor typed. */
const CTA_ID = /^[a-z0-9_]{1,40}$/;

/**
 * Mounted once in the locale layout: starts the analytics sender, records a `page_view` on every
 * route change, and a `cta_click` for any click on an element carrying `data-track="<cta id>"`
 * (one delegated listener, so server and client components can mark their CTAs the same way).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => startAnalytics(), []);

  useEffect(() => {
    // The ref keeps React's development double-run from counting one view twice.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    track("page_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest("[data-track]") : null;
      const cta = target?.getAttribute("data-track");
      if (cta && CTA_ID.test(cta)) track("cta_click", { cta });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
