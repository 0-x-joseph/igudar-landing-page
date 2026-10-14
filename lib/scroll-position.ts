import { clearLanguageScrollPosition, languageScrollTop, type LanguageScrollPosition } from "./language-scroll-position";

const STORAGE_PREFIX = "igudar:scroll:";
const RESTORE_WINDOW_MS = 3000;

// The actual pathname includes the locale. Query strings and anchors identify
// separate views; positions stay in this tab, not in localStorage or analytics.
function storageKey(pathname: string): string {
  return `${STORAGE_PREFIX}${pathname}${window.location.search}${window.location.hash}`;
}

export function isReloadNavigation(): boolean {
  const navigation = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
  return navigation?.type === "reload";
}

export function readScrollPosition(pathname: string): number | null {
  try {
    const value = sessionStorage.getItem(storageKey(pathname));
    if (value === null || value.trim() === "") return null;
    const top = Number(value);
    return Number.isFinite(top) && top >= 0 ? top : null;
  } catch {
    // Storage can be blocked; leave native browser restoration working.
    return null;
  }
}

/** Remember this view and optionally restore a pixel or translated-section position.
 * Restoration is bounded, instantaneous and cancelled by user interaction.
 * Wait for fonts/load and retry while the document is still too short. */
export function trackScrollPosition(
  pathname: string,
  restoreTop: number | null,
  languagePosition: LanguageScrollPosition | null = null,
): () => void {
  let restoring = restoreTop !== null || languagePosition !== null;
  let disposed = false;
  let latestTop = restoreTop ?? window.scrollY;
  let saveFrame = 0;
  let restoreFrame = 0;
  let timer = 0;
  let fontsReady = !document.fonts || document.fonts.status === "loaded";
  let stableFrames = 0;
  const started = performance.now();

  const persist = () => {
    saveFrame = 0;
    // Route changes can replace the DOM before effect cleanup. Never record
    // the new page's height/position against the outgoing page's URL.
    if (window.location.pathname !== pathname) return;
    try {
      sessionStorage.setItem(storageKey(pathname), String(Math.round(latestTop)));
    } catch {
      // Scrolling must keep working when sessionStorage is unavailable/full.
    }
  };

  const onScroll = () => {
    if (restoring || window.location.pathname !== pathname) return;
    latestTop = window.scrollY;
    if (!saveFrame) saveFrame = requestAnimationFrame(persist);
  };

  const finish = () => {
    if (disposed) return;
    restoring = false;
    cancelAnimationFrame(restoreFrame);
    window.clearTimeout(timer);
    latestTop = window.scrollY;
    persist();
    if (languagePosition) clearLanguageScrollPosition(languagePosition);
  };

  const restore = () => {
    if (disposed || !restoring) return;
    if (window.location.pathname !== pathname) { finish(); return; }
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    // Recalculate translated section geometry as fonts and content settle.
    const targetTop = languagePosition ? languageScrollTop(languagePosition) : restoreTop!;
    const top = Math.min(targetTop, maxTop);
    if (Math.abs(window.scrollY - top) > 1) {
      window.scrollTo({ top, left: 0, behavior: "instant" });
      stableFrames = 0;
    } else {
      stableFrames++;
    }
    // A brief settling window also catches framework hydration scroll changes.
    if (fontsReady && document.readyState === "complete" && maxTop >= targetTop &&
        stableFrames >= 3 && performance.now() - started >= 150) {
      finish();
    } else {
      restoreFrame = requestAnimationFrame(restore);
    }
  };

  const cancelRestore = () => { if (restoring) finish(); };
  const flush = () => {
    if (!restoring) latestTop = window.scrollY;
    persist();
  };
  const onVisibilityChange = () => { if (document.visibilityState === "hidden") flush(); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("wheel", cancelRestore, { passive: true });
  window.addEventListener("touchstart", cancelRestore, { passive: true });
  window.addEventListener("pointerdown", cancelRestore, { passive: true });
  window.addEventListener("keydown", cancelRestore);
  window.addEventListener("hashchange", cancelRestore);
  window.addEventListener("popstate", cancelRestore);

  if (restoring) {
    document.fonts?.ready.then(() => { fontsReady = true; });
    timer = window.setTimeout(finish, RESTORE_WINDOW_MS);
    restore();
  } else {
    persist();
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(saveFrame);
    cancelAnimationFrame(restoreFrame);
    window.clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", flush);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("wheel", cancelRestore);
    window.removeEventListener("touchstart", cancelRestore);
    window.removeEventListener("pointerdown", cancelRestore);
    window.removeEventListener("keydown", cancelRestore);
    window.removeEventListener("hashchange", cancelRestore);
    window.removeEventListener("popstate", cancelRestore);
  };
}
