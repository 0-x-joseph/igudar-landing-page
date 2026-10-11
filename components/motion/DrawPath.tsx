"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MOTION } from "./tokens";

type Props = {
  d: string;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeLinecap?: "butt" | "round" | "square";
  /** Seconds before the stroke starts to draw. */
  delay?: number;
  duration?: number;
};

/**
 * An SVG path whose stroke draws itself the first time it scrolls into view.
 * Under prefers-reduced-motion (or without JS) the finished line is shown.
 */
export function DrawPath({ delay = 0, duration = MOTION.drawS, ...rest }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <path {...rest} />;
  return (
    <motion.path
      {...rest}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: MOTION.ease }}
    />
  );
}
