"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const DURATION_MS = 200;

/**
 * Eases between values over 200 ms. Under prefers-reduced-motion the value is shown
 * instantly. The first render shows the final value (no count-up on load).
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    if (reduce) return;
    const from = displayRef.current;
    if (from === value) return;
    let start: number | null = null;
    let raf = 0;
    const tick = (now: number) => {
      // Take the clock from the first frame so the timestamp origin never matters.
      if (start === null) start = now;
      const t = Math.min(1, Math.max(0, (now - start) / DURATION_MS));
      const eased = 1 - Math.pow(1 - t, 3);
      const next = t >= 1 ? value : from + (value - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <span className={className}>{format(reduce ? value : display)}</span>;
}
