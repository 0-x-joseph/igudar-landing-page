"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Puts every new page at its top. Next's own scroll handling is skipped or animated from the bottom when the
 * document smooth-scrolls, so on a pathname change we jump to the top instantly (never animated). The first render
 * is left alone (the browser restores scroll on reload) and so are hash links, which scroll to their own target.
 */
const ScrollToTop = () => {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
