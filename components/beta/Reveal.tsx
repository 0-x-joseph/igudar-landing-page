"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** "mount" plays on load (above the fold); "view" plays once when scrolled into view. */
  on?: "mount" | "view";
}

/** Subtle entrance (fade and rise). Renders a plain div when the visitor prefers reduced motion. */
export function Reveal({ children, className, delay = 0, on = "view" }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const initial = { opacity: 0, y: 16 };
  const shown = { opacity: 1, y: 0 };
  const transition = { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const };

  return on === "mount" ? (
    <motion.div className={className} initial={initial} animate={shown} transition={transition}>
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={className}
      initial={initial}
      whileInView={shown}
      viewport={{ once: true, margin: "-40px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
