"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isReloadNavigation, readScrollPosition, trackScrollPosition } from "@/lib/scroll-position";
import { readLanguageScrollPosition } from "@/lib/language-scroll-position";

/**
 * New pages start at the top; reloads and history visits resume where this tab
 * left off. Language changes use a section-relative bookmark, while new
 * anchor navigation stays native. Raw pathnames separate locale-specific views.
 */
const ScrollToTop = () => {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const hasNavigated = useRef(false);
  const historyPath = useRef<string | null>(null);

  useEffect(() => {
    const onPopState = () => { historyPath.current = window.location.pathname; };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const changed = previous.current !== pathname;
    if (changed) hasNavigated.current = true;
    previous.current = pathname;
    const fromHistory = historyPath.current === pathname;
    historyPath.current = null;
    if (changed && !fromHistory && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    // Safe under StrictMode's repeated initial effects; never restore an old
    // position when arriving through a normal client-side link.
    const restoreTop = fromHistory || (!hasNavigated.current && isReloadNavigation())
      ? readScrollPosition(pathname) : null;
    const languagePosition = !hasNavigated.current ? readLanguageScrollPosition() : null;
    return trackScrollPosition(pathname, restoreTop, languagePosition);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
