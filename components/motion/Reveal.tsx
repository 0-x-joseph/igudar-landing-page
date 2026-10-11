"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "./tokens";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position in a group: delays this item by `index` staggers, so siblings enter one after the other. */
  index?: number;
  /** Extra delay in seconds. */
  delay?: number;
  /** "view" plays once when scrolled into view; "mount" plays on load (above the fold). */
  on?: "view" | "mount";
  /** Tag to render, so a list item can reveal itself without an extra wrapper. */
  as?: "div" | "li" | "section" | "article" | "p" | "span";
}

/**
 * The site's entrance: fade up 12 px over 320 ms, ease-out, with an optional stagger.
 * Under prefers-reduced-motion it renders the plain element, so nothing moves or hides.
 */
export function Reveal({ children, className, index = 0, delay = 0, on = "view", as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }
  const Tag = motion[as];
  const initial = { opacity: 0, y: MOTION.riseY };
  const shown = { opacity: 1, y: 0 };
  const transition = { duration: MOTION.durationS, delay: delay + index * MOTION.staggerS, ease: MOTION.ease };
  return on === "mount" ? (
    <Tag className={className} initial={initial} animate={shown} transition={transition}>
      {children}
    </Tag>
  ) : (
    <Tag
      className={className}
      initial={initial}
      whileInView={shown}
      viewport={{ once: true, margin: "-40px" }}
      transition={transition}
    >
      {children}
    </Tag>
  );
}
