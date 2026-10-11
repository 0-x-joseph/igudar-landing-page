"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const FIRST_RUN_MS = 900;
const UPDATE_MS = 350;

/**
 * Counts a figure up from zero the first time it scrolls into view, then eases between values
 * when the input changes. Server markup, no-JS, reduced motion and "never in view" all show the
 * exact final value, so a figure is never wrong or blank. No new dependency: one rAF loop.
 */
export function CountUp({
  value,
  format,
  className,
  durationMs = FIRST_RUN_MS,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  durationMs?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [tween, setTween] = useState<number | null>(null);
  const shown = useRef(value);
  const latest = useRef(value);
  const seen = useRef(false);
  const target = useRef(value);
  const raf = useRef(0);

  const run = (from: number, to: number, ms: number) => {
    cancelAnimationFrame(raf.current);
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, Math.max(0, (now - start) / ms));
      const eased = 1 - Math.pow(1 - t, 3);
      const next = t >= 1 ? to : from + (to - from) * eased;
      shown.current = next;
      setTween(t >= 1 ? null : next);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (reduce || typeof IntersectionObserver === "undefined" || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || seen.current) return;
        seen.current = true;
        observer.disconnect();
        target.current = latest.current;
        run(0, latest.current, durationMs);
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [reduce, durationMs]);

  useEffect(() => {
    latest.current = value;
    if (reduce || !seen.current) {
      shown.current = value;
      target.current = value;
      return;
    }
    // Mid count-up the target is unchanged: let the running tween finish instead of restarting it.
    if (shown.current === value || value === target.current) return;
    target.current = value;
    run(shown.current, value, UPDATE_MS);
  }, [value, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(reduce || tween === null ? value : tween)}
    </span>
  );
}
