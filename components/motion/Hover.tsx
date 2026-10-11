"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "./tokens";

/** Hover lift: the child rises 2 px. A plain wrapper under prefers-reduced-motion. */
export function Hover({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -MOTION.liftPx }}
      transition={{ duration: 0.18, ease: MOTION.ease }}
    >
      {children}
    </motion.div>
  );
}
